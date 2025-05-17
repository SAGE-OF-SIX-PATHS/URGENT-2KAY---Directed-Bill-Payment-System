import { spawn } from 'child_process';
import path from 'path';

// Start backend server
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '../../'),
  stdio: 'inherit'
});

// Start frontend server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '../../../frontend'),
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});

console.log('Started both frontend and backend servers');
console.log('Press Ctrl+C to stop both servers'); 
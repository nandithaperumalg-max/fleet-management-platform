import cluster from 'cluster';
import os from 'os';
import './server.js';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`[Master Cluster] Primary process ${process.pid} is running.`);
  console.log(`[Master Cluster] Forking ${numCPUs} worker processes for high-availability load distribution...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[Master Cluster] Worker ${worker.process.pid} exited with code ${code}. Respawning a replacement worker...`);
    cluster.fork();
  });
} else {
  // Workers share the same TCP connection port managed by cluster module
  console.log(`[Worker Process] Worker ${process.pid} started and accepting traffic.`);
}

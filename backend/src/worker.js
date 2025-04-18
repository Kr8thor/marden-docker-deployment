async function runWorker() {
  while (true) {
    console.log("Worker is running");
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

module.exports = { runWorker };
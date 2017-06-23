export default async function initiateProducerFromPlugin(cfgs = {}) {
  const { plugin } = cfgs;

  return plugin().producer(cfgs);
}


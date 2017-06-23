function checkCfgs(cfgs) {
  const errMsg = configuration => `Consumer: "${configuration}" configuration is required`;

  const { groupId } = cfgs;

  if (!groupId) {
    throw new Error(errMsg('groupId'));
  }
}

export default async function initiateConsumerFromPlugin(cfgs = {}) {
  checkCfgs(cfgs);

  const { plugin } = cfgs;

  return plugin().consumer(cfgs);
}


const baseGen = jest.fn();
const cfgTypeKeyGen = jest.fn(() => baseGen);

cfgTypeKeyGen.baseGen = baseGen;

export default cfgTypeKeyGen;

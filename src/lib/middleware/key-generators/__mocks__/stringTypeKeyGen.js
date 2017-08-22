const baseGen = jest.fn();
const stringTypeKeyGen = jest.fn(() => baseGen);

stringTypeKeyGen.baseGen = baseGen;

export default stringTypeKeyGen;

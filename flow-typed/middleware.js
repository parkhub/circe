/* @flow */
/* eslint-disable no-unused-vars */

type KeyGenStringType = string;
type Validate = (message: Message) => void;
type ValidatorsMap = Map<Topic, Validate>;

type KeyGenCfgType = {|
  topic: Topic,
  keyProp?: string
|};

type Validator = {|
  topic: Topic,
  validate: Validate
|};

type KeyGenResult = {|
  key: string,
  message: Message
|};

type KeyGeneratorArgs = {
  key: string,
  message: Message
};

type KeyGenerator = KeyGeneratorArgs => KeyGenResult;
type KeyGeneratorsCfg = KeyGenStringType | KeyGenCfgType;

type ApplyMiddlewareResult = {|
  message: Message,
  key: string
|};

type ApplyMiddleware = ({ topic: string, message: Message, key: string }) => ApplyMiddlewareResult;

type Middleware = {|
  preValidators?: Validator[],
  postValidators?: Validator[],
  keyGenerators?: KeyGeneratorsCfg[]
|};

import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.should();
chai.use(sinonChai);

const expect = chai.expect;

export { expect, sinon };

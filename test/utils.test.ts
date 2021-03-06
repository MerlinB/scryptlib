import { expect } from 'chai'
import { num2bin, bin2num, bsv, parseLiteral, literal2ScryptType, int2Asm} from '../src/utils'

const BN = bsv.crypto.BN

describe('utils', () => {
  describe('num2bin()', () => {
    it('should return searialized format of the number with certain bytes length', () => {
      expect(num2bin(0, 1)).to.equal('00')
      expect(num2bin(10, 1)).to.equal('0a')
      expect(num2bin(0x123, 2)).to.equal('2301')
      expect(num2bin(0x123456789abcde, 7)).to.equal('debc9a78563412')
      expect(num2bin(-1000, 2)).to.equal('e883')

      // padded
      expect(num2bin(0, 3)).to.equal('000000')
      expect(num2bin(1, 2)).to.equal('0100')
      expect(num2bin(0x123456789abcde, 10)).to.equal('debc9a78563412000000')
      expect(num2bin(-1000, 4)).to.equal('e8030080')
      expect(num2bin(-123456789, 8)).to.equal('15cd5b0700000080')
    })

    it('Bigint', () => {
      expect(num2bin(0n, 1)).to.equal('00')
      expect(num2bin(10n, 1)).to.equal('0a')
      expect(num2bin(-1000n, 2)).to.equal('e883')

      // padded
      expect(num2bin(0n, 3)).to.equal('000000')
      expect(num2bin(1n, 2)).to.equal('0100')
      expect(num2bin(-1000n, 4)).to.equal('e8030080')
      expect(num2bin(-123456789n, 8)).to.equal('15cd5b0700000080')
    })

    it('should raise error if the number can not fit in certain bytes length', () => {
      expect(() => num2bin(128, 1)).to.throw('128 cannot fit in 1 byte[s]')
      expect(() => num2bin(0xffff, 2)).to.throw('65535 cannot fit in 2 byte[s]')
    })
  })

  describe('bin2num()', () => {
    it('bin2num', () => {
      expect(bin2num('00')).to.equal(0n)
      expect(bin2num('0a')).to.equal(0x0an)
      expect(bin2num('2301')).to.equal(0x123n)
      expect(bin2num('debc9a78563412')).to.equal(0x123456789abcden)
      expect(bin2num('e883')).to.equal(-1000n)

      expect(bin2num('000000')).to.equal(0n)
      expect(bin2num('0100')).to.equal(1n)
      expect(bin2num('debc9a78563412000000')).to.equal(0x123456789abcden)
      expect(bin2num('e8030080')).to.equal(-1000n)
      expect(bin2num('15cd5b0700000080')).to.equal(-123456789n)
    })
  })

  describe('num2bin() & bin2num()', () => {
    it('support bigint type', () => {
      // max number in Javascript
      let bn = BigInt(Number.MAX_SAFE_INTEGER)
      const bnZero = BigInt(0)
      expect(num2bin(bnZero, 32)).to.equal('00'.repeat(32))
      expect(bin2num('00'.repeat(32))).to.equal(0n)
      const bnOne = BigInt(1)
      const bnHundred = BigInt(100)
      bn = bn + bnOne
      expect(num2bin(bn, 8)).to.equal('0000000000002000')
      expect(bin2num('0000000000002000')).to.equal(bn)
      bn = bn + bnHundred
      expect(num2bin(bn, 8)).to.equal('6400000000002000')
      expect(bin2num('6400000000002000')).to.equal(bn)
      //negative bigint
      bn = -bn
      expect(num2bin(bn, 8)).to.equal('6400000000002080')
      expect(bin2num('6400000000002080')).to.equal(bn)
    })

    it('support BN.js type', () => {
      // max number in Javascript
      let bn = new BN(Number.MAX_SAFE_INTEGER)
      const bnOne = new BN(1)
      const bnHundred = new BN(100)
      bn = bn.add(bnOne)
      expect(num2bin(bn, 8)).to.equal('0000000000002000')
      expect(bin2num('0000000000002000').toString()).to.equal(bn.toString())
      bn = bn.add(bnHundred)
      expect(num2bin(bn, 8)).to.equal('6400000000002000')
      expect(bin2num('6400000000002000').toString()).to.equal(bn.toString())
      //negative bigint
      bn = bn.neg()
      expect(num2bin(bn, 8)).to.equal('6400000000002080')
      expect(bin2num('6400000000002080').toString()).to.equal(bn.toString())
    })

    it('HexInt with 9bytes', () => {
      const bn = new BN('010000000000200001', 16, 'le')
      expect(num2bin(bn, 9)).to.equal('010000000000200001')
      expect(bin2num('010000000000200001').toString()).to.equal(bn.toString())
    })

    it('UInt256 with 32ytes', () => {
      const bn = new BN(
        '0100000000002000010000000000200001000000000020000100000000002000',
        16,
        'le'
      )
      expect(num2bin(bn, 32)).to.equal(
        '0100000000002000010000000000200001000000000020000100000000002000'
      )
      expect(
        bin2num(
          '0100000000002000010000000000200001000000000020000100000000002000'
        ).toString()
      ).to.equal(bn.toString())
    })

    it('support bin2num Buffer', () => {
      const bn = new BN('010000000000200001', 16, 'le')
      expect(num2bin(bn, 9)).to.equal('010000000000200001')
      const buffer = bn.toBuffer({ endian: 'little', size: 9 })
      expect(bin2num(buffer).toString()).to.equal(bn.toString())
    })

  })


  describe('int2Asm()', () => {

    it('int string to asm', () => {
      expect(int2Asm("992218700866541488854030164190743727617658394826382323005192752278160641622424126616186015754450906117445668830393086070718237548341612508577988597572812"))
      .to.equal("cce42011b595b8ef7742710a4492a130e4b7e020097044e7b86258f82ae25f0467e8a0141ae5afd7038810f692f52d43fbb03363b8320d3b43dc65092eddf112")


      expect(int2Asm("0x12f1dd2e0965dc433b0d32b86333b0fb432df592f6108803d7afe51a14a0e867045fe22af85862b8e744700920e0b7e430a192440a714277efb895b51120e4cc"))
      .to.equal("cce42011b595b8ef7742710a4492a130e4b7e020097044e7b86258f82ae25f0467e8a0141ae5afd7038810f692f52d43fbb03363b8320d3b43dc65092eddf112")
    });
  })



  describe('parseLiteral()', () => {

    it('parser Literal string', () => {
      expect(parseLiteral("9007199254740991")).to.have.members(["ffffffffffff1f", BigInt(9007199254740991), "int"]);
      expect(parseLiteral("0xdebc9a78563")).to.have.members(["6385a7c9eb0d", 15306351674723, "int"]);
      expect(parseLiteral("0")).to.have.members(["OP_0", 0, "int"]);
      expect(parseLiteral("16")).to.have.members(["OP_16", 16, "int"]);
      expect(parseLiteral("-1")).to.have.members(["OP_1NEGATE", -1, "int"]);
      expect(parseLiteral("-111111")).to.have.members(["07b281", -111111, "int"]);
      expect(parseLiteral("false")).to.have.members(["OP_FALSE", false, "bool"]);
      expect(parseLiteral("b''")).to.have.members(["OP_0", "", "bytes"]);
      expect(parseLiteral("b'62f0245bb9'")).to.have.members(["62f0245bb9", "62f0245bb9", "bytes"]);
      expect(parseLiteral("PrivKey(1)")).to.have.members(["1", 1, "PrivKey"]);
      expect(parseLiteral("PrivKey(0x3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062)")).to.have.members([
          "0x3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062",
          BigInt("0x3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062"),
          "PrivKey"
        ]);
      expect(parseLiteral("PubKey(b'3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062')")).to.have.members([
          "3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062", 
          "3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062", 
          "PubKey"
        ]);
      expect(parseLiteral("Sig(b'3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062')")).to.have.members([
        "3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062",
        "3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062",
        "Sig"]);
      expect(parseLiteral("Ripemd160(b'3847f126769a6c65d281d925f9ff99')")).to.have.members(["3847f126769a6c65d281d925f9ff99", "3847f126769a6c65d281d925f9ff99", "Ripemd160"]);
      expect(parseLiteral("Sha1(b'3847f126769a6c65d281d925f9ff99')")).to.have.members(["3847f126769a6c65d281d925f9ff99", "3847f126769a6c65d281d925f9ff99", "Sha1"]);
      expect(parseLiteral("Sha256(b'3847f126769a6c65d281d925f9ff99')")).to.have.members(["3847f126769a6c65d281d925f9ff99", "3847f126769a6c65d281d925f9ff99", "Sha256"]);
      expect(parseLiteral("SigHashType(b'01')")).to.have.members(["01", 0x01, "SigHashType"]);
      expect(parseLiteral("SigHashType(b'02')")).to.have.members(["02", 0x02, "SigHashType"]);
      expect(parseLiteral("SigHashType(b'03')")).to.have.members(["03", 0x03, "SigHashType"]);
      expect(parseLiteral("SigHashType(b'40')")).to.have.members(["40", 0x40, "SigHashType"]);
      expect(parseLiteral("SigHashType(b'80')")).to.have.members(["80", 0x80, "SigHashType"]);
      expect(parseLiteral("SigHashPreimage(b'3847f126769a6c65d281d925f9ff99')")).to.have.members(["3847f126769a6c65d281d925f9ff99", "3847f126769a6c65d281d925f9ff99", "SigHashPreimage"]);
      expect(parseLiteral("OpCodeType(b'01')")).to.have.members(["01", "01", "OpCodeType"]);
    });
  })


  describe('literal2ScryptType()', () => {

    it('literal2ScryptType', () => {
      expect(literal2ScryptType("9007199254740991").value).to.equal(BigInt(9007199254740991));
      expect(literal2ScryptType("0xdebc9a78563").value).to.equal(15306351674723);
      expect(literal2ScryptType("0").value).to.equal(0);
      expect(literal2ScryptType("-1").value).to.equal(-1);
      expect(literal2ScryptType("false").value).to.equal(false);
      expect(literal2ScryptType("b''").value).to.equal("");
      expect(literal2ScryptType("b'62f0245bb9'").value).to.equal("62f0245bb9");
      expect(literal2ScryptType("PrivKey(1)").value).to.equal(1);
      expect(literal2ScryptType("PrivKey(1)").toLiteral()).to.equal("PrivKey(0x01)");
      //mocha do not  know how to serialize a BigInt, so call toString and compare it
      expect(literal2ScryptType("PrivKey(0x3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062)").value.toString())
        .to.equal("25456630020100109444707942782143792492829674412994957270434525334028981432418");

      expect(literal2ScryptType("PrivKey(0x3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062)").toLiteral())
        .to.equal("PrivKey(0x3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062)");

      expect(literal2ScryptType("b'62f0245bb9'").value).to.equal("62f0245bb9");


      expect(literal2ScryptType("PubKey(b'3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062')").value)
        .to.equal("3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062");
      expect(literal2ScryptType("PubKey(b'3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062')").toLiteral())
        .to.equal("PubKey(b'3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062')");

      expect(literal2ScryptType("Sig(b'3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062')").value)
        .to.equal("3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062");
      expect(literal2ScryptType("Sig(b'3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062')").toLiteral())
        .to.equal("Sig(b'3847f126769a6c65d281d925f9ff990f431d19c8c314f9180def0ab95b24f062')");

      expect(literal2ScryptType("Ripemd160(b'3847f126769a6c65d281d925f9ff99')").value)
        .to.equal("3847f126769a6c65d281d925f9ff99");
      expect(literal2ScryptType("Ripemd160(b'3847f126769a6c65d281d925f9ff99')").toLiteral())
        .to.equal("Ripemd160(b'3847f126769a6c65d281d925f9ff99')");


      expect(literal2ScryptType("Sha1(b'3847f126769a6c65d281d925f9ff99')").value)
        .to.equal("3847f126769a6c65d281d925f9ff99");
      expect(literal2ScryptType("Sha1(b'3847f126769a6c65d281d925f9ff99')").toLiteral())
        .to.equal("Sha1(b'3847f126769a6c65d281d925f9ff99')");

      expect(literal2ScryptType("Sha256(b'3847f126769a6c65d281d925f9ff99')").value)
        .to.equal("3847f126769a6c65d281d925f9ff99");
      expect(literal2ScryptType("Sha256(b'3847f126769a6c65d281d925f9ff99')").toLiteral())
        .to.equal("Sha256(b'3847f126769a6c65d281d925f9ff99')");


      expect(literal2ScryptType("SigHashType(b'01')").value)
        .to.equal(0x01);
      expect(literal2ScryptType("SigHashType(b'80')").value)
        .to.equal(0x80);
      expect(literal2ScryptType("SigHashType(b'01')").toLiteral())
        .to.equal("SigHashType(b'01')");

      expect(literal2ScryptType("SigHashPreimage(b'3847f126769a6c65d281d925f9ff99')").value)
        .to.equal("3847f126769a6c65d281d925f9ff99");
      expect(literal2ScryptType("SigHashPreimage(b'3847f126769a6c65d281d925f9ff99')").toLiteral())
        .to.equal("SigHashPreimage(b'3847f126769a6c65d281d925f9ff99')");


      expect(literal2ScryptType("OpCodeType(b'01')").value)
        .to.equal("01");
      expect(literal2ScryptType("OpCodeType(b'01')").toLiteral())
        .to.equal("OpCodeType(b'01')");
    });
  })

})

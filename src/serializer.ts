import { bin2num, bsv, num2bin } from './utils'

const Script = bsv.Script
const Opcode = bsv.Opcode
const BN = bsv.crypto.BN
// number of bytes to denote state length after serialization, exclusing varint prefix
const STATE_LEN = 2

function serializeBool(flag: boolean): string {
  return flag ? 'OP_TRUE' : 'OP_FALSE'
}

function serializeInt(n: number | bigint): string {
  const num = new BN(n)
  if (num == 0) {
    return '00'
  }
  return num.toSM({ endian: 'little' }).toString('hex')
}

// TODO: validate
function serializeBytes(hexStr: string): string {
    return hexStr
}

function serialize(x: boolean | number | bigint | string) {
  if (typeof x === 'boolean') {
    return serializeBool(x)
  }
  if (typeof x === 'number') {
    return serializeInt(x)
  }
  if (typeof x === 'bigint') {
    return serializeInt(x)
  } else {
    return serializeBytes(x)
  }
}

export type State = Record<string, boolean | number | bigint | string>
export type StateArray = Array<boolean | number | bigint | string>

// serialize contract state into Script ASM
export function serializeState(state: State | StateArray, stateBytes: number = STATE_LEN ): string {
  const asms = []

  Object.values(state).forEach((s) => {
    const str = serialize(s)
    asms.push(str)
  })

  const script = Script.fromASM(asms.join(' '))
  const scriptHex = script.toHex()
  const stateLen = scriptHex.length / 2

  // use fixed size to denote state len
  const len = num2bin(stateLen, stateBytes)
  return script.toASM() + ' ' + len
}

class OpState {
  public op: any;

  constructor(op) {
    this.op = op;
  }

  toNumber() : number {
    return Number(this.toBigInt());
  }

  toBigInt() : bigint {
    if (this.op.opcodenum === Opcode.OP_1) {
      return 1n;
    } else if (this.op.opcodenum === Opcode.OP_0) {
      return 0n;
    } else if (this.op.opcodenum === Opcode.OP_1NEGATE) {
      return -1n;
    } else if (this.op.opcodenum >= Opcode.OP_2 && this.op.opcodenum <= Opcode.OP_16) {
      return BigInt(this.op.opcodenum - Opcode.OP_2 + 2);
    } else {
      if(!this.op.buf) throw new Error('state does not have a number representation');
      return bin2num(this.op.buf);
    }
  }

  toBoolean() : boolean {
    return this.toBigInt() !== 0n;
  }

  toHex() : string {
    if(!this.op.buf) throw new Error('state does not have a hexadecimal representation');
    return this.op.buf.toString('hex');
  }

  toString(arg: string | number = undefined) : string {
    if(!this.op.buf) throw new Error('state does not have a string representation');
    return this.op.buf.toString(arg);
  }
}

export type OpStateArray = Array<OpState>

// deserialize Script or Script Hex or Script ASM Code to contract state array and object
export function deserializeState(s: string | bsv.Script, stateClass: State = undefined): OpStateArray | State {
  let script: bsv.Script;
  try{
    script = new Script(s)
  } catch(e) {
    script = Script.fromASM(s)
  }
  const chunks = script.chunks
  const states = []
  let pos = chunks.length
  //the last opcode is length of stats, skip
  for (let i = pos - 2; i >= 0; i--) {
    const opcodenum = chunks[i].opcodenum
    if (opcodenum === Opcode.OP_RETURN) {
      break
    } else {
      states.push(new OpState(chunks[i]))
    }
  }
  states.reverse();

  //deserialize to an array
  if(!stateClass) {
    return states;
  }

  //deserialize to an object
  const ret: State = {};
  const keys = Object.keys(stateClass);
  for (let i = 0; i < states.length; i++) {
    const key = keys[i];
    if(!key) {
      break;
    }
    const val = stateClass[key];
    if (val === 'boolean' || typeof val === 'boolean') {
      ret[key] = states[i].toBoolean()
    } else if (val === 'number' || typeof val === 'number') {
      ret[key] = states[i].toNumber()
    } else if (val === 'bigint' || typeof val === 'bigint') {
      ret[key] = states[i].toBigInt()
    } else {
      ret[key] = states[i].toHex()
    }
  }
  return ret;
}

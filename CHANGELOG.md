# CHANGELOG


## 0.2.23

* add struct support
* add static getAsmvars fn
* change rename to renameSync
* return error position with start/end in SemanticError

## 0.2.22

* remove scryptc dependencies
* fixed get scripcode bug of preimage


## 0.2.21

* support get asmVars
* bug fix: semantic errors contains end location, besides start loc


## 0.2.20

* add literal2ScryptType
* add parseLiteral
* deprecated literal2Asm


## 0.2.19

* support new array

## 0.2.18

* bug fix: used scrypt binary as compiler in 0.2.17 

## 0.2.17

* support byte
* support bool and int array 

## 0.2.14

* support empty bytes

## 0.2.13

* support serializer

## 0.2.4

* support SigHashPreimage type

## 0.2.0

* add some options to compile function
* change source location in compileResult from path to uri

## 0.1.9

* support ASM variable instantiation

## 0.1.8

* change pub function index start from 0, not 1

* type "Bytes" -> "byte[]"

## 0.1.6

Enhancements:

* simplify verify() return to error, not exception
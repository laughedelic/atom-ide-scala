'use strict';
/* Scala.js runtime support
 * Copyright 2013 LAMP/EPFL
 * Author: Sébastien Doeraene
 */

/* ---------------------------------- *
 * The top-level Scala.js environment *
 * ---------------------------------- */





// Get the environment info
const $env = (typeof __ScalaJSEnv === "object" && __ScalaJSEnv) ? __ScalaJSEnv : {};

// Global scope
const $g =
  (typeof $env["global"] === "object" && $env["global"])
    ? $env["global"]
    : ((typeof global === "object" && global && global["Object"] === Object) ? global : this);
$env["global"] = $g;

// Where to send exports

const $e = exports;





$env["exportsNamespace"] = $e;

// Freeze the environment info
$g["Object"]["freeze"]($env);

// Linking info - must be in sync with scala.scalajs.runtime.LinkingInfo
const $linkingInfo = {
  "envInfo": $env,
  "semantics": {






    "asInstanceOfs": 2,








    "arrayIndexOutOfBounds": 2,








    "moduleInit": 2,





    "strictFloats": false,


    "productionMode": true



  },

  "assumingES6": true,



  "linkerVersion": "0.6.21",
  "globalThis": this
};
$g["Object"]["freeze"]($linkingInfo);
$g["Object"]["freeze"]($linkingInfo["semantics"]);

// Snapshots of builtins and polyfills


const $imul = $g["Math"]["imul"];
const $fround = $g["Math"]["fround"];
const $clz32 = $g["Math"]["clz32"];







































// Other fields




















let $lastIDHash = 0; // last value attributed to an id hash code

const $idHashCodeMap = new $g["WeakMap"]();





// Core mechanism

const $makeIsArrayOfPrimitive = function(primitiveData) {
  return function(obj, depth) {
    return !!(obj && obj.$classData &&
      (obj.$classData.arrayDepth === depth) &&
      (obj.$classData.arrayBase === primitiveData));
  }
};












/** Encode a property name for runtime manipulation
  *  Usage:
  *    env.propertyName({someProp:0})
  *  Returns:
  *    "someProp"
  *  Useful when the property is renamed by a global optimizer (like Closure)
  *  but we must still get hold of a string of that name for runtime
  * reflection.
  */
const $propertyName = function(obj) {
  for (const prop in obj)
    return prop;
};

// Runtime functions

const $isScalaJSObject = function(obj) {
  return !!(obj && obj.$classData);
};
































const $noIsInstance = function(instance) {
  throw new $g["TypeError"](
    "Cannot call isInstance() on a Class representing a raw JS trait/object");
};

const $makeNativeArrayWrapper = function(arrayClassData, nativeArray) {
  return new arrayClassData.constr(nativeArray);
};

const $newArrayObject = function(arrayClassData, lengths) {
  return $newArrayObjectInternal(arrayClassData, lengths, 0);
};

const $newArrayObjectInternal = function(arrayClassData, lengths, lengthIndex) {
  const result = new arrayClassData.constr(lengths[lengthIndex]);

  if (lengthIndex < lengths.length-1) {
    const subArrayClassData = arrayClassData.componentData;
    const subLengthIndex = lengthIndex+1;
    const underlying = result.u;
    for (let i = 0; i < underlying.length; i++) {
      underlying[i] = $newArrayObjectInternal(
        subArrayClassData, lengths, subLengthIndex);
    }
  }

  return result;
};

const $objectToString = function(instance) {
  if (instance === void 0)
    return "undefined";
  else
    return instance.toString();
};

const $objectGetClass = function(instance) {
  switch (typeof instance) {
    case "string":
      return $d_T.getClassOf();
    case "number": {
      const v = instance | 0;
      if (v === instance) { // is the value integral?
        if ($isByte(v))
          return $d_jl_Byte.getClassOf();
        else if ($isShort(v))
          return $d_jl_Short.getClassOf();
        else
          return $d_jl_Integer.getClassOf();
      } else {
        if ($isFloat(instance))
          return $d_jl_Float.getClassOf();
        else
          return $d_jl_Double.getClassOf();
      }
    }
    case "boolean":
      return $d_jl_Boolean.getClassOf();
    case "undefined":
      return $d_sr_BoxedUnit.getClassOf();
    default:
      if (instance === null)
        return instance.getClass__jl_Class();
      else if ($is_sjsr_RuntimeLong(instance))
        return $d_jl_Long.getClassOf();
      else if ($isScalaJSObject(instance))
        return instance.$classData.getClassOf();
      else
        return null; // Exception?
  }
};

const $objectClone = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.clone__O();
  else
    throw new $c_jl_CloneNotSupportedException().init___();
};

const $objectNotify = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notify__V();
};

const $objectNotifyAll = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notifyAll__V();
};

const $objectFinalize = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    instance.finalize__V();
  // else no-op
};

const $objectEquals = function(instance, rhs) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.equals__O__Z(rhs);
  else if (typeof instance === "number")
    return typeof rhs === "number" && $numberEquals(instance, rhs);
  else
    return instance === rhs;
};

const $numberEquals = function(lhs, rhs) {
  return (lhs === rhs) ? (
    // 0.0.equals(-0.0) must be false
    lhs !== 0 || 1/lhs === 1/rhs
  ) : (
    // are they both NaN?
    (lhs !== lhs) && (rhs !== rhs)
  );
};

const $objectHashCode = function(instance) {
  switch (typeof instance) {
    case "string":
      return $m_sjsr_RuntimeString$().hashCode__T__I(instance);
    case "number":
      return $m_sjsr_Bits$().numberHashCode__D__I(instance);
    case "boolean":
      return instance ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      if ($isScalaJSObject(instance) || instance === null)
        return instance.hashCode__I();




      else
        return $systemIdentityHashCode(instance);
  }
};

const $comparableCompareTo = function(instance, rhs) {
  switch (typeof instance) {
    case "string":



      return instance === rhs ? 0 : (instance < rhs ? -1 : 1);
    case "number":



      return $m_jl_Double$().compare__D__D__I(instance, rhs);
    case "boolean":



      return instance - rhs; // yes, this gives the right result
    default:
      return instance.compareTo__O__I(rhs);
  }
};

const $charSequenceLength = function(instance) {
  if (typeof(instance) === "string")



    return instance["length"] | 0;

  else
    return instance.length__I();
};

const $charSequenceCharAt = function(instance, index) {
  if (typeof(instance) === "string")



    return instance["charCodeAt"](index) & 0xffff;

  else
    return instance.charAt__I__C(index);
};

const $charSequenceSubSequence = function(instance, start, end) {
  if (typeof(instance) === "string")



    return instance["substring"](start, end);

  else
    return instance.subSequence__I__I__jl_CharSequence(start, end);
};

const $booleanBooleanValue = function(instance) {
  if (typeof instance === "boolean") return instance;
  else                               return instance.booleanValue__Z();
};

const $numberByteValue = function(instance) {
  if (typeof instance === "number") return (instance << 24) >> 24;
  else                              return instance.byteValue__B();
};
const $numberShortValue = function(instance) {
  if (typeof instance === "number") return (instance << 16) >> 16;
  else                              return instance.shortValue__S();
};
const $numberIntValue = function(instance) {
  if (typeof instance === "number") return instance | 0;
  else                              return instance.intValue__I();
};
const $numberLongValue = function(instance) {
  if (typeof instance === "number")
    return $m_sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(instance);
  else
    return instance.longValue__J();
};
const $numberFloatValue = function(instance) {
  if (typeof instance === "number") return $fround(instance);
  else                              return instance.floatValue__F();
};
const $numberDoubleValue = function(instance) {
  if (typeof instance === "number") return instance;
  else                              return instance.doubleValue__D();
};

const $isNaN = function(instance) {
  return instance !== instance;
};

const $isInfinite = function(instance) {
  return !$g["isFinite"](instance) && !$isNaN(instance);
};

const $doubleToInt = function(x) {
  return (x > 2147483647) ? (2147483647) : ((x < -2147483648) ? -2147483648 : (x | 0));
};

/** Instantiates a JS object with variadic arguments to the constructor. */
const $newJSObjectWithVarargs = function(ctor, args) {
  // This basically emulates the ECMAScript specification for 'new'.
  const instance = $g["Object"]["create"](ctor.prototype);
  const result = ctor["apply"](instance, args);
  switch (typeof result) {
    case "string": case "number": case "boolean": case "undefined": case "symbol":
      return instance;
    default:
      return result === null ? instance : result;
  }
};

const $resolveSuperRef = function(initialProto, propName) {
  const getPrototypeOf = $g["Object"]["getPrototypeOf"];
  const getOwnPropertyDescriptor = $g["Object"]["getOwnPropertyDescriptor"];

  let superProto = getPrototypeOf(initialProto);
  while (superProto !== null) {
    const desc = getOwnPropertyDescriptor(superProto, propName);
    if (desc !== void 0)
      return desc;
    superProto = getPrototypeOf(superProto);
  }

  return void 0;
};

const $superGet = function(initialProto, self, propName) {
  const desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    const getter = desc["get"];
    if (getter !== void 0)
      return getter["call"](self);
    else
      return desc["value"];
  }
  return void 0;
};

const $superSet = function(initialProto, self, propName, value) {
  const desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    const setter = desc["set"];
    if (setter !== void 0) {
      setter["call"](self, value);
      return void 0;
    }
  }
  throw new $g["TypeError"]("super has no setter '" + propName + "'.");
};


const $moduleDefault = function(m) {
  return (m && (typeof m === "object") && "default" in m) ? m["default"] : m;
};


const $propertiesOf = function(obj) {
  const result = [];
  for (const prop in obj)
    result["push"](prop);
  return result;
};

const $systemArraycopy = function(src, srcPos, dest, destPos, length) {
  const srcu = src.u;
  const destu = dest.u;









  if (srcu !== destu || destPos < srcPos || (((srcPos + length) | 0) < destPos)) {
    for (let i = 0; i < length; i = (i + 1) | 0)
      destu[(destPos + i) | 0] = srcu[(srcPos + i) | 0];
  } else {
    for (let i = (length - 1) | 0; i >= 0; i = (i - 1) | 0)
      destu[(destPos + i) | 0] = srcu[(srcPos + i) | 0];
  }
};

const $systemIdentityHashCode =



  (function(obj) {
    switch (typeof obj) {
      case "string": case "number": case "boolean": case "undefined":
        return $objectHashCode(obj);
      default:
        if (obj === null) {
          return 0;
        } else {
          let hash = $idHashCodeMap["get"](obj);
          if (hash === void 0) {
            hash = ($lastIDHash + 1) | 0;
            $lastIDHash = hash;
            $idHashCodeMap["set"](obj, hash);
          }
          return hash;
        }
    }





















  });

// is/as for hijacked boxed classes (the non-trivial ones)

const $isByte = function(v) {
  return typeof v === "number" && (v << 24 >> 24) === v && 1/v !== 1/-0;
};

const $isShort = function(v) {
  return typeof v === "number" && (v << 16 >> 16) === v && 1/v !== 1/-0;
};

const $isInt = function(v) {
  return typeof v === "number" && (v | 0) === v && 1/v !== 1/-0;
};

const $isFloat = function(v) {



  return typeof v === "number";

};




















































// Unboxes




























const $uJ = function(value) {
  return null === value ? $m_sjsr_RuntimeLong$().Zero$1 : value;
};


// TypeArray conversions

const $byteArray2TypedArray = function(value) { return new $g["Int8Array"](value.u); };
const $shortArray2TypedArray = function(value) { return new $g["Int16Array"](value.u); };
const $charArray2TypedArray = function(value) { return new $g["Uint16Array"](value.u); };
const $intArray2TypedArray = function(value) { return new $g["Int32Array"](value.u); };
const $floatArray2TypedArray = function(value) { return new $g["Float32Array"](value.u); };
const $doubleArray2TypedArray = function(value) { return new $g["Float64Array"](value.u); };

const $typedArray2ByteArray = function(value) {
  const arrayClassData = $d_B.getArrayOf();
  return new arrayClassData.constr(new $g["Int8Array"](value));
};
const $typedArray2ShortArray = function(value) {
  const arrayClassData = $d_S.getArrayOf();
  return new arrayClassData.constr(new $g["Int16Array"](value));
};
const $typedArray2CharArray = function(value) {
  const arrayClassData = $d_C.getArrayOf();
  return new arrayClassData.constr(new $g["Uint16Array"](value));
};
const $typedArray2IntArray = function(value) {
  const arrayClassData = $d_I.getArrayOf();
  return new arrayClassData.constr(new $g["Int32Array"](value));
};
const $typedArray2FloatArray = function(value) {
  const arrayClassData = $d_F.getArrayOf();
  return new arrayClassData.constr(new $g["Float32Array"](value));
};
const $typedArray2DoubleArray = function(value) {
  const arrayClassData = $d_D.getArrayOf();
  return new arrayClassData.constr(new $g["Float64Array"](value));
};

// TypeData class





class $TypeData {
constructor() {

  // Runtime support
  this.constr = void 0;
  this.parentData = void 0;
  this.ancestors = null;
  this.componentData = null;
  this.arrayBase = null;
  this.arrayDepth = 0;
  this.zero = null;
  this.arrayEncodedName = "";
  this._classOf = void 0;
  this._arrayOf = void 0;
  this.isArrayOf = void 0;

  // java.lang.Class support
  this["name"] = "";
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = false;
  this["isRawJSType"] = false;
  this["isInstance"] = void 0;
};




initPrim(

    zero, arrayEncodedName, displayName) {
  // Runtime support
  this.ancestors = {};
  this.componentData = null;
  this.zero = zero;
  this.arrayEncodedName = arrayEncodedName;
  this.isArrayOf = function(obj, depth) { return false; };

  // java.lang.Class support
  this["name"] = displayName;
  this["isPrimitive"] = true;
  this["isInstance"] = function(obj) { return false; };

  return this;
};




initClass(

    internalNameObj, isInterface, fullName,
    ancestors, isRawJSType, parentData, isInstance, isArrayOf) {
  const internalName = $propertyName(internalNameObj);

  isInstance = isInstance || function(obj) {
    return !!(obj && obj.$classData && obj.$classData.ancestors[internalName]);
  };

  isArrayOf = isArrayOf || function(obj, depth) {
    return !!(obj && obj.$classData && (obj.$classData.arrayDepth === depth)
      && obj.$classData.arrayBase.ancestors[internalName])
  };

  // Runtime support
  this.parentData = parentData;
  this.ancestors = ancestors;
  this.arrayEncodedName = "L"+fullName+";";
  this.isArrayOf = isArrayOf;

  // java.lang.Class support
  this["name"] = fullName;
  this["isInterface"] = isInterface;
  this["isRawJSType"] = !!isRawJSType;
  this["isInstance"] = isInstance;

  return this;
};




initArray(

    componentData) {
  // The constructor

  const componentZero0 = componentData.zero;

  // The zero for the Long runtime representation
  // is a special case here, since the class has not
  // been defined yet, when this file is read
  const componentZero = (componentZero0 == "longZero")
    ? $m_sjsr_RuntimeLong$().Zero$1
    : componentZero0;






































  class ArrayClass extends $c_O {
    constructor(arg) {
      super();
      if (typeof(arg) === "number") {
        // arg is the length of the array
        this.u = new Array(arg);
        for (let i = 0; i < arg; i++)
          this.u[i] = componentZero;
      } else {
        // arg is a native array that we wrap
        this.u = arg;
      }
    };














    clone__O() {
      if (this.u instanceof Array)
        return new ArrayClass(this.u["slice"](0));
      else
        // The underlying Array is a TypedArray
        return new ArrayClass(new this.u.constructor(this.u));
    };
  };


  ArrayClass.prototype.$classData = this;

  // Don't generate reflective call proxies. The compiler special cases
  // reflective calls to methods on scala.Array

  // The data

  const encodedName = "[" + componentData.arrayEncodedName;
  const componentBase = componentData.arrayBase || componentData;
  const arrayDepth = componentData.arrayDepth + 1;

  const isInstance = function(obj) {
    return componentBase.isArrayOf(obj, arrayDepth);
  }

  // Runtime support
  this.constr = ArrayClass;
  this.parentData = $d_O;
  this.ancestors = {O: 1, jl_Cloneable: 1, Ljava_io_Serializable: 1};
  this.componentData = componentData;
  this.arrayBase = componentBase;
  this.arrayDepth = arrayDepth;
  this.zero = null;
  this.arrayEncodedName = encodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = undefined;

  // java.lang.Class support
  this["name"] = encodedName;
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = true;
  this["isInstance"] = isInstance;

  return this;
};




getClassOf() {

  if (!this._classOf)
    this._classOf = new $c_jl_Class().init___jl_ScalaJSClassData(this);
  return this._classOf;
};




getArrayOf() {

  if (!this._arrayOf)
    this._arrayOf = new $TypeData().initArray(this);
  return this._arrayOf;
};

// java.lang.Class support




"getFakeInstance"() {

  if (this === $d_T)
    return "some string";
  else if (this === $d_jl_Boolean)
    return false;
  else if (this === $d_jl_Byte ||
           this === $d_jl_Short ||
           this === $d_jl_Integer ||
           this === $d_jl_Float ||
           this === $d_jl_Double)
    return 0;
  else if (this === $d_jl_Long)
    return $m_sjsr_RuntimeLong$().Zero$1;
  else if (this === $d_sr_BoxedUnit)
    return void 0;
  else
    return {$classData: this};
};




"getSuperclass"() {

  return this.parentData ? this.parentData.getClassOf() : null;
};




"getComponentType"() {

  return this.componentData ? this.componentData.getClassOf() : null;
};




"newArrayOfThisClass"(lengths) {

  let arrayClassData = this;
  for (let i = 0; i < lengths.length; i++)
    arrayClassData = arrayClassData.getArrayOf();
  return $newArrayObject(arrayClassData, lengths);
};

};


// Create primitive types

const $d_V = new $TypeData().initPrim(undefined, "V", "void");
const $d_Z = new $TypeData().initPrim(false, "Z", "boolean");
const $d_C = new $TypeData().initPrim(0, "C", "char");
const $d_B = new $TypeData().initPrim(0, "B", "byte");
const $d_S = new $TypeData().initPrim(0, "S", "short");
const $d_I = new $TypeData().initPrim(0, "I", "int");
const $d_J = new $TypeData().initPrim("longZero", "J", "long");
const $d_F = new $TypeData().initPrim(0.0, "F", "float");
const $d_D = new $TypeData().initPrim(0.0, "D", "double");

// Instance tests for array of primitives

const $isArrayOf_Z = $makeIsArrayOfPrimitive($d_Z);
$d_Z.isArrayOf = $isArrayOf_Z;

const $isArrayOf_C = $makeIsArrayOfPrimitive($d_C);
$d_C.isArrayOf = $isArrayOf_C;

const $isArrayOf_B = $makeIsArrayOfPrimitive($d_B);
$d_B.isArrayOf = $isArrayOf_B;

const $isArrayOf_S = $makeIsArrayOfPrimitive($d_S);
$d_S.isArrayOf = $isArrayOf_S;

const $isArrayOf_I = $makeIsArrayOfPrimitive($d_I);
$d_I.isArrayOf = $isArrayOf_I;

const $isArrayOf_J = $makeIsArrayOfPrimitive($d_J);
$d_J.isArrayOf = $isArrayOf_J;

const $isArrayOf_F = $makeIsArrayOfPrimitive($d_F);
$d_F.isArrayOf = $isArrayOf_F;

const $isArrayOf_D = $makeIsArrayOfPrimitive($d_D);
$d_D.isArrayOf = $isArrayOf_D;












const $i_atom$002dlanguageclient = require("atom-languageclient");
const $i_os = require("os");
const $i_path = require("path");
const $i_child$005fprocess = require("child_process");
class $c_O {
  init___() {
    return this
  };
  toString__T() {
    const jsx$2 = $objectGetClass(this).getName__T();
    const i = this.hashCode__I();
    const x = (+(i >>> 0));
    const jsx$1 = x.toString(16);
    return ((jsx$2 + "@") + jsx$1)
  };
  hashCode__I() {
    return $systemIdentityHashCode(this)
  };
  "toString"() {
    return this.toString__T()
  };
}
const $is_O = (function(obj) {
  return (obj !== null)
});
const $isArrayOf_O = (function(obj, depth) {
  const data = (obj && obj.$classData);
  if ((!data)) {
    return false
  } else {
    const arrayDepth = (data.arrayDepth || 0);
    return ((!(arrayDepth < depth)) && ((arrayDepth > depth) || (!data.arrayBase.isPrimitive)))
  }
});
const $d_O = new $TypeData().initClass({
  O: 0
}, false, "java.lang.Object", {
  O: 1
}, (void 0), (void 0), $is_O, $isArrayOf_O);
$c_O.prototype.$classData = $d_O;
const $f_s_util_control_NoStackTrace__fillInStackTrace__jl_Throwable = (function($thiz) {
  const this$1 = $m_s_util_control_NoStackTrace$();
  if (this$1.$$undnoSuppression$1) {
    return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call($thiz)
  } else {
    return $thiz
  }
});
const $f_sci_VectorPointer__copyOf__AO__AO = (function($thiz, a) {
  const copy = $newArrayObject($d_O.getArrayOf(), [a.u.length]);
  $systemArraycopy(a, 0, copy, 0, a.u.length);
  return copy
});
const $f_sci_VectorPointer__gotoNextBlockStart__I__I__V = (function($thiz, index, xor) {
  if ((xor < 1024)) {
    $thiz.display0$und$eq__AO__V($thiz.display1__AO().u[(31 & ((index >>> 5) | 0))])
  } else if ((xor < 32768)) {
    $thiz.display1$und$eq__AO__V($thiz.display2__AO().u[(31 & ((index >>> 10) | 0))]);
    $thiz.display0$und$eq__AO__V($thiz.display1__AO().u[0])
  } else if ((xor < 1048576)) {
    $thiz.display2$und$eq__AO__V($thiz.display3__AO().u[(31 & ((index >>> 15) | 0))]);
    $thiz.display1$und$eq__AO__V($thiz.display2__AO().u[0]);
    $thiz.display0$und$eq__AO__V($thiz.display1__AO().u[0])
  } else if ((xor < 33554432)) {
    $thiz.display3$und$eq__AO__V($thiz.display4__AO().u[(31 & ((index >>> 20) | 0))]);
    $thiz.display2$und$eq__AO__V($thiz.display3__AO().u[0]);
    $thiz.display1$und$eq__AO__V($thiz.display2__AO().u[0]);
    $thiz.display0$und$eq__AO__V($thiz.display1__AO().u[0])
  } else if ((xor < 1073741824)) {
    $thiz.display4$und$eq__AO__V($thiz.display5__AO().u[(31 & ((index >>> 25) | 0))]);
    $thiz.display3$und$eq__AO__V($thiz.display4__AO().u[0]);
    $thiz.display2$und$eq__AO__V($thiz.display3__AO().u[0]);
    $thiz.display1$und$eq__AO__V($thiz.display2__AO().u[0]);
    $thiz.display0$und$eq__AO__V($thiz.display1__AO().u[0])
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
});
const $f_sci_VectorPointer__getElem__I__I__O = (function($thiz, index, xor) {
  if ((xor < 32)) {
    return $thiz.display0__AO().u[(31 & index)]
  } else if ((xor < 1024)) {
    return $thiz.display1__AO().u[(31 & ((index >>> 5) | 0))].u[(31 & index)]
  } else if ((xor < 32768)) {
    return $thiz.display2__AO().u[(31 & ((index >>> 10) | 0))].u[(31 & ((index >>> 5) | 0))].u[(31 & index)]
  } else if ((xor < 1048576)) {
    return $thiz.display3__AO().u[(31 & ((index >>> 15) | 0))].u[(31 & ((index >>> 10) | 0))].u[(31 & ((index >>> 5) | 0))].u[(31 & index)]
  } else if ((xor < 33554432)) {
    return $thiz.display4__AO().u[(31 & ((index >>> 20) | 0))].u[(31 & ((index >>> 15) | 0))].u[(31 & ((index >>> 10) | 0))].u[(31 & ((index >>> 5) | 0))].u[(31 & index)]
  } else if ((xor < 1073741824)) {
    return $thiz.display5__AO().u[(31 & ((index >>> 25) | 0))].u[(31 & ((index >>> 20) | 0))].u[(31 & ((index >>> 15) | 0))].u[(31 & ((index >>> 10) | 0))].u[(31 & ((index >>> 5) | 0))].u[(31 & index)]
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
});
const $f_sci_VectorPointer__gotoPos__I__I__V = (function($thiz, index, xor) {
  if ((xor >= 32)) {
    if ((xor < 1024)) {
      $thiz.display0$und$eq__AO__V($thiz.display1__AO().u[(31 & ((index >>> 5) | 0))])
    } else if ((xor < 32768)) {
      $thiz.display1$und$eq__AO__V($thiz.display2__AO().u[(31 & ((index >>> 10) | 0))]);
      $thiz.display0$und$eq__AO__V($thiz.display1__AO().u[(31 & ((index >>> 5) | 0))])
    } else if ((xor < 1048576)) {
      $thiz.display2$und$eq__AO__V($thiz.display3__AO().u[(31 & ((index >>> 15) | 0))]);
      $thiz.display1$und$eq__AO__V($thiz.display2__AO().u[(31 & ((index >>> 10) | 0))]);
      $thiz.display0$und$eq__AO__V($thiz.display1__AO().u[(31 & ((index >>> 5) | 0))])
    } else if ((xor < 33554432)) {
      $thiz.display3$und$eq__AO__V($thiz.display4__AO().u[(31 & ((index >>> 20) | 0))]);
      $thiz.display2$und$eq__AO__V($thiz.display3__AO().u[(31 & ((index >>> 15) | 0))]);
      $thiz.display1$und$eq__AO__V($thiz.display2__AO().u[(31 & ((index >>> 10) | 0))]);
      $thiz.display0$und$eq__AO__V($thiz.display1__AO().u[(31 & ((index >>> 5) | 0))])
    } else if ((xor < 1073741824)) {
      $thiz.display4$und$eq__AO__V($thiz.display5__AO().u[(31 & ((index >>> 25) | 0))]);
      $thiz.display3$und$eq__AO__V($thiz.display4__AO().u[(31 & ((index >>> 20) | 0))]);
      $thiz.display2$und$eq__AO__V($thiz.display3__AO().u[(31 & ((index >>> 15) | 0))]);
      $thiz.display1$und$eq__AO__V($thiz.display2__AO().u[(31 & ((index >>> 10) | 0))]);
      $thiz.display0$und$eq__AO__V($thiz.display1__AO().u[(31 & ((index >>> 5) | 0))])
    } else {
      throw new $c_jl_IllegalArgumentException().init___()
    }
  }
});
const $f_sci_VectorPointer__stabilize__I__V = (function($thiz, index) {
  const x1 = (((-1) + $thiz.depth__I()) | 0);
  switch (x1) {
    case 5: {
      const a = $thiz.display5__AO();
      $thiz.display5$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a));
      const a$1 = $thiz.display4__AO();
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$1));
      const a$2 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$2));
      const a$3 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$3));
      const a$4 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$4));
      $thiz.display5__AO().u[(31 & ((index >>> 25) | 0))] = $thiz.display4__AO();
      $thiz.display4__AO().u[(31 & ((index >>> 20) | 0))] = $thiz.display3__AO();
      $thiz.display3__AO().u[(31 & ((index >>> 15) | 0))] = $thiz.display2__AO();
      $thiz.display2__AO().u[(31 & ((index >>> 10) | 0))] = $thiz.display1__AO();
      $thiz.display1__AO().u[(31 & ((index >>> 5) | 0))] = $thiz.display0__AO();
      break
    }
    case 4: {
      const a$5 = $thiz.display4__AO();
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$5));
      const a$6 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$6));
      const a$7 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$7));
      const a$8 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$8));
      $thiz.display4__AO().u[(31 & ((index >>> 20) | 0))] = $thiz.display3__AO();
      $thiz.display3__AO().u[(31 & ((index >>> 15) | 0))] = $thiz.display2__AO();
      $thiz.display2__AO().u[(31 & ((index >>> 10) | 0))] = $thiz.display1__AO();
      $thiz.display1__AO().u[(31 & ((index >>> 5) | 0))] = $thiz.display0__AO();
      break
    }
    case 3: {
      const a$9 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$9));
      const a$10 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$10));
      const a$11 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$11));
      $thiz.display3__AO().u[(31 & ((index >>> 15) | 0))] = $thiz.display2__AO();
      $thiz.display2__AO().u[(31 & ((index >>> 10) | 0))] = $thiz.display1__AO();
      $thiz.display1__AO().u[(31 & ((index >>> 5) | 0))] = $thiz.display0__AO();
      break
    }
    case 2: {
      const a$12 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$12));
      const a$13 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$13));
      $thiz.display2__AO().u[(31 & ((index >>> 10) | 0))] = $thiz.display1__AO();
      $thiz.display1__AO().u[(31 & ((index >>> 5) | 0))] = $thiz.display0__AO();
      break
    }
    case 1: {
      const a$14 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$14));
      $thiz.display1__AO().u[(31 & ((index >>> 5) | 0))] = $thiz.display0__AO();
      break
    }
    case 0: {
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
});
const $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V = (function($thiz, that, depth) {
  $thiz.depth$und$eq__I__V(depth);
  const x1 = (((-1) + depth) | 0);
  switch (x1) {
    case (-1): {
      break
    }
    case 0: {
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 1: {
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 2: {
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 3: {
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 4: {
      $thiz.display4$und$eq__AO__V(that.display4__AO());
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 5: {
      $thiz.display5$und$eq__AO__V(that.display5__AO());
      $thiz.display4$und$eq__AO__V(that.display4__AO());
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
});
class $c_Llaughedelic_atom_ide_scala_Exports$ extends $c_O {
  constructor() {
    super();
    this.client$1 = null
  };
  init___() {
    $n_Llaughedelic_atom_ide_scala_Exports$ = this;
    this.client$1 = new ($a_Llaughedelic_atom_ide_scala_ScalaLanguageClient())();
    return this
  };
  deactivate__sjs_js_Promise() {
    return this.client$1.deactivate()
  };
  consumeBusySignal__Llaughedelic_atom_ide_scala_facade_atom$undide_busy$undsignal_BusySignalService__V(service) {
    this.client$1.consumeBusySignal(service)
  };
  consumeLinterV2__sjs_js_Any__V(registerIndie) {
    this.client$1.consumeLinterV2(registerIndie)
  };
  provideDefinitions__sjs_js_Any() {
    return this.client$1.provideDefinitions()
  };
  activate__V() {
    this.client$1.activate()
  };
  provideCodeFormat__sjs_js_Any() {
    return this.client$1.provideCodeFormat()
  };
  provideAutocomplete__sjs_js_Any() {
    return this.client$1.provideAutocomplete()
  };
  consumeDatatip__sjs_js_Any__V(service) {
    this.client$1.consumeDatatip(service)
  };
  provideOutlines__sjs_js_Any() {
    return this.client$1.provideOutlines()
  };
}
const $d_Llaughedelic_atom_ide_scala_Exports$ = new $TypeData().initClass({
  Llaughedelic_atom_ide_scala_Exports$: 0
}, false, "laughedelic.atom.ide.scala.Exports$", {
  Llaughedelic_atom_ide_scala_Exports$: 1,
  O: 1
});
$c_Llaughedelic_atom_ide_scala_Exports$.prototype.$classData = $d_Llaughedelic_atom_ide_scala_Exports$;
let $n_Llaughedelic_atom_ide_scala_Exports$ = (void 0);
const $m_Llaughedelic_atom_ide_scala_Exports$ = (function() {
  if ((!$n_Llaughedelic_atom_ide_scala_Exports$)) {
    $n_Llaughedelic_atom_ide_scala_Exports$ = new $c_Llaughedelic_atom_ide_scala_Exports$().init___()
  };
  return $n_Llaughedelic_atom_ide_scala_Exports$
});
class $c_jl_Class extends $c_O {
  constructor() {
    super();
    this.data$1 = null
  };
  getName__T() {
    return this.data$1.name
  };
  isPrimitive__Z() {
    return (!(!this.data$1.isPrimitive))
  };
  toString__T() {
    return ((this.isInterface__Z() ? "interface " : (this.isPrimitive__Z() ? "" : "class ")) + this.getName__T())
  };
  init___jl_ScalaJSClassData(data) {
    this.data$1 = data;
    return this
  };
  isInterface__Z() {
    return (!(!this.data$1.isInterface))
  };
}
const $d_jl_Class = new $TypeData().initClass({
  jl_Class: 0
}, false, "java.lang.Class", {
  jl_Class: 1,
  O: 1
});
$c_jl_Class.prototype.$classData = $d_jl_Class;
class $c_s_LowPriorityImplicits extends $c_O {
}
class $c_s_math_Ordered$ extends $c_O {
  init___() {
    return this
  };
}
const $d_s_math_Ordered$ = new $TypeData().initClass({
  s_math_Ordered$: 0
}, false, "scala.math.Ordered$", {
  s_math_Ordered$: 1,
  O: 1
});
$c_s_math_Ordered$.prototype.$classData = $d_s_math_Ordered$;
let $n_s_math_Ordered$ = (void 0);
const $m_s_math_Ordered$ = (function() {
  if ((!$n_s_math_Ordered$)) {
    $n_s_math_Ordered$ = new $c_s_math_Ordered$().init___()
  };
  return $n_s_math_Ordered$
});
class $c_s_package$ extends $c_O {
  constructor() {
    super();
    this.BigDecimal$1 = null;
    this.BigInt$1 = null;
    this.AnyRef$1 = null;
    this.Traversable$1 = null;
    this.Iterable$1 = null;
    this.Seq$1 = null;
    this.IndexedSeq$1 = null;
    this.Iterator$1 = null;
    this.List$1 = null;
    this.Nil$1 = null;
    this.$$colon$colon$1 = null;
    this.$$plus$colon$1 = null;
    this.$$colon$plus$1 = null;
    this.Stream$1 = null;
    this.$$hash$colon$colon$1 = null;
    this.Vector$1 = null;
    this.StringBuilder$1 = null;
    this.Range$1 = null;
    this.Equiv$1 = null;
    this.Fractional$1 = null;
    this.Integral$1 = null;
    this.Numeric$1 = null;
    this.Ordered$1 = null;
    this.Ordering$1 = null;
    this.Either$1 = null;
    this.Left$1 = null;
    this.Right$1 = null;
    this.bitmap$0$1 = 0
  };
  init___() {
    $n_s_package$ = this;
    this.AnyRef$1 = new $c_s_package$$anon$1().init___();
    this.Traversable$1 = $m_sc_Traversable$();
    this.Iterable$1 = $m_sc_Iterable$();
    this.Seq$1 = $m_sc_Seq$();
    this.IndexedSeq$1 = $m_sc_IndexedSeq$();
    this.Iterator$1 = $m_sc_Iterator$();
    this.List$1 = $m_sci_List$();
    this.Nil$1 = $m_sci_Nil$();
    this.$$colon$colon$1 = $m_sci_$colon$colon$();
    this.$$plus$colon$1 = $m_sc_$plus$colon$();
    this.$$colon$plus$1 = $m_sc_$colon$plus$();
    this.Stream$1 = $m_sci_Stream$();
    this.$$hash$colon$colon$1 = $m_sci_Stream$$hash$colon$colon$();
    this.Vector$1 = $m_sci_Vector$();
    this.StringBuilder$1 = $m_scm_StringBuilder$();
    this.Range$1 = $m_sci_Range$();
    this.Equiv$1 = $m_s_math_Equiv$();
    this.Fractional$1 = $m_s_math_Fractional$();
    this.Integral$1 = $m_s_math_Integral$();
    this.Numeric$1 = $m_s_math_Numeric$();
    this.Ordered$1 = $m_s_math_Ordered$();
    this.Ordering$1 = $m_s_math_Ordering$();
    this.Either$1 = $m_s_util_Either$();
    this.Left$1 = $m_s_util_Left$();
    this.Right$1 = $m_s_util_Right$();
    return this
  };
}
const $d_s_package$ = new $TypeData().initClass({
  s_package$: 0
}, false, "scala.package$", {
  s_package$: 1,
  O: 1
});
$c_s_package$.prototype.$classData = $d_s_package$;
let $n_s_package$ = (void 0);
const $m_s_package$ = (function() {
  if ((!$n_s_package$)) {
    $n_s_package$ = new $c_s_package$().init___()
  };
  return $n_s_package$
});
class $c_s_reflect_ClassManifestFactory$ extends $c_O {
  constructor() {
    super();
    this.Byte$1 = null;
    this.Short$1 = null;
    this.Char$1 = null;
    this.Int$1 = null;
    this.Long$1 = null;
    this.Float$1 = null;
    this.Double$1 = null;
    this.Boolean$1 = null;
    this.Unit$1 = null;
    this.Any$1 = null;
    this.Object$1 = null;
    this.AnyVal$1 = null;
    this.Nothing$1 = null;
    this.Null$1 = null
  };
  init___() {
    $n_s_reflect_ClassManifestFactory$ = this;
    this.Byte$1 = $m_s_reflect_ManifestFactory$ByteManifest$();
    this.Short$1 = $m_s_reflect_ManifestFactory$ShortManifest$();
    this.Char$1 = $m_s_reflect_ManifestFactory$CharManifest$();
    this.Int$1 = $m_s_reflect_ManifestFactory$IntManifest$();
    this.Long$1 = $m_s_reflect_ManifestFactory$LongManifest$();
    this.Float$1 = $m_s_reflect_ManifestFactory$FloatManifest$();
    this.Double$1 = $m_s_reflect_ManifestFactory$DoubleManifest$();
    this.Boolean$1 = $m_s_reflect_ManifestFactory$BooleanManifest$();
    this.Unit$1 = $m_s_reflect_ManifestFactory$UnitManifest$();
    this.Any$1 = $m_s_reflect_ManifestFactory$AnyManifest$();
    this.Object$1 = $m_s_reflect_ManifestFactory$ObjectManifest$();
    this.AnyVal$1 = $m_s_reflect_ManifestFactory$AnyValManifest$();
    this.Nothing$1 = $m_s_reflect_ManifestFactory$NothingManifest$();
    this.Null$1 = $m_s_reflect_ManifestFactory$NullManifest$();
    return this
  };
}
const $d_s_reflect_ClassManifestFactory$ = new $TypeData().initClass({
  s_reflect_ClassManifestFactory$: 0
}, false, "scala.reflect.ClassManifestFactory$", {
  s_reflect_ClassManifestFactory$: 1,
  O: 1
});
$c_s_reflect_ClassManifestFactory$.prototype.$classData = $d_s_reflect_ClassManifestFactory$;
let $n_s_reflect_ClassManifestFactory$ = (void 0);
const $m_s_reflect_ClassManifestFactory$ = (function() {
  if ((!$n_s_reflect_ClassManifestFactory$)) {
    $n_s_reflect_ClassManifestFactory$ = new $c_s_reflect_ClassManifestFactory$().init___()
  };
  return $n_s_reflect_ClassManifestFactory$
});
class $c_s_reflect_ManifestFactory$ extends $c_O {
  init___() {
    return this
  };
}
const $d_s_reflect_ManifestFactory$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$: 0
}, false, "scala.reflect.ManifestFactory$", {
  s_reflect_ManifestFactory$: 1,
  O: 1
});
$c_s_reflect_ManifestFactory$.prototype.$classData = $d_s_reflect_ManifestFactory$;
let $n_s_reflect_ManifestFactory$ = (void 0);
const $m_s_reflect_ManifestFactory$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$)) {
    $n_s_reflect_ManifestFactory$ = new $c_s_reflect_ManifestFactory$().init___()
  };
  return $n_s_reflect_ManifestFactory$
});
class $c_s_reflect_package$ extends $c_O {
  constructor() {
    super();
    this.ClassManifest$1 = null;
    this.Manifest$1 = null
  };
  init___() {
    $n_s_reflect_package$ = this;
    this.ClassManifest$1 = $m_s_reflect_ClassManifestFactory$();
    this.Manifest$1 = $m_s_reflect_ManifestFactory$();
    return this
  };
}
const $d_s_reflect_package$ = new $TypeData().initClass({
  s_reflect_package$: 0
}, false, "scala.reflect.package$", {
  s_reflect_package$: 1,
  O: 1
});
$c_s_reflect_package$.prototype.$classData = $d_s_reflect_package$;
let $n_s_reflect_package$ = (void 0);
const $m_s_reflect_package$ = (function() {
  if ((!$n_s_reflect_package$)) {
    $n_s_reflect_package$ = new $c_s_reflect_package$().init___()
  };
  return $n_s_reflect_package$
});
class $c_s_util_control_Breaks extends $c_O {
  constructor() {
    super();
    this.scala$util$control$Breaks$$breakException$1 = null
  };
  init___() {
    this.scala$util$control$Breaks$$breakException$1 = new $c_s_util_control_BreakControl().init___();
    return this
  };
}
const $d_s_util_control_Breaks = new $TypeData().initClass({
  s_util_control_Breaks: 0
}, false, "scala.util.control.Breaks", {
  s_util_control_Breaks: 1,
  O: 1
});
$c_s_util_control_Breaks.prototype.$classData = $d_s_util_control_Breaks;
class $c_s_util_hashing_MurmurHash3 extends $c_O {
  mixLast__I__I__I(hash, data) {
    let k = data;
    k = $imul((-862048943), k);
    const i = k;
    k = ((i << 15) | ((i >>> 17) | 0));
    k = $imul(461845907, k);
    return (hash ^ k)
  };
  mix__I__I__I(hash, data) {
    let h = this.mixLast__I__I__I(hash, data);
    const i = h;
    h = ((i << 13) | ((i >>> 19) | 0));
    return (((-430675100) + $imul(5, h)) | 0)
  };
  avalanche__p1__I__I(hash) {
    let h = hash;
    h = (h ^ ((h >>> 16) | 0));
    h = $imul((-2048144789), h);
    h = (h ^ ((h >>> 13) | 0));
    h = $imul((-1028477387), h);
    h = (h ^ ((h >>> 16) | 0));
    return h
  };
  productHash__s_Product__I__I(x, seed) {
    const arr = x.productArity__I();
    if ((arr === 0)) {
      const this$1 = x.productPrefix__T();
      return $m_sjsr_RuntimeString$().hashCode__T__I(this$1)
    } else {
      let h = seed;
      let i = 0;
      while ((i < arr)) {
        h = this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(x.productElement__I__O(i)));
        i = ((1 + i) | 0)
      };
      return this.finalizeHash__I__I__I(h, arr)
    }
  };
  finalizeHash__I__I__I(hash, length) {
    return this.avalanche__p1__I__I((hash ^ length))
  };
  orderedHash__sc_TraversableOnce__I__I(xs, seed) {
    const n = new $c_sr_IntRef().init___I(0);
    const h = new $c_sr_IntRef().init___I(seed);
    xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, n$1, h$1) {
      return (function(x$2) {
        h$1.elem$1 = $this.mix__I__I__I(h$1.elem$1, $m_sr_Statics$().anyHash__O__I(x$2));
        n$1.elem$1 = ((1 + n$1.elem$1) | 0)
      })
    })(this, n, h)));
    return this.finalizeHash__I__I__I(h.elem$1, n.elem$1)
  };
  listHash__sci_List__I__I(xs, seed) {
    let n = 0;
    let h = seed;
    let elems = xs;
    while ((!elems.isEmpty__Z())) {
      const this$1 = elems;
      this$1.head__sr_Nothing$()
    };
    return this.finalizeHash__I__I__I(h, n)
  };
}
class $c_sc_$colon$plus$ extends $c_O {
  init___() {
    return this
  };
}
const $d_sc_$colon$plus$ = new $TypeData().initClass({
  sc_$colon$plus$: 0
}, false, "scala.collection.$colon$plus$", {
  sc_$colon$plus$: 1,
  O: 1
});
$c_sc_$colon$plus$.prototype.$classData = $d_sc_$colon$plus$;
let $n_sc_$colon$plus$ = (void 0);
const $m_sc_$colon$plus$ = (function() {
  if ((!$n_sc_$colon$plus$)) {
    $n_sc_$colon$plus$ = new $c_sc_$colon$plus$().init___()
  };
  return $n_sc_$colon$plus$
});
class $c_sc_$plus$colon$ extends $c_O {
  init___() {
    return this
  };
}
const $d_sc_$plus$colon$ = new $TypeData().initClass({
  sc_$plus$colon$: 0
}, false, "scala.collection.$plus$colon$", {
  sc_$plus$colon$: 1,
  O: 1
});
$c_sc_$plus$colon$.prototype.$classData = $d_sc_$plus$colon$;
let $n_sc_$plus$colon$ = (void 0);
const $m_sc_$plus$colon$ = (function() {
  if ((!$n_sc_$plus$colon$)) {
    $n_sc_$plus$colon$ = new $c_sc_$plus$colon$().init___()
  };
  return $n_sc_$plus$colon$
});
class $c_sc_Iterator$ extends $c_O {
  constructor() {
    super();
    this.empty$1 = null
  };
  init___() {
    $n_sc_Iterator$ = this;
    this.empty$1 = new $c_sc_Iterator$$anon$2().init___();
    return this
  };
}
const $d_sc_Iterator$ = new $TypeData().initClass({
  sc_Iterator$: 0
}, false, "scala.collection.Iterator$", {
  sc_Iterator$: 1,
  O: 1
});
$c_sc_Iterator$.prototype.$classData = $d_sc_Iterator$;
let $n_sc_Iterator$ = (void 0);
const $m_sc_Iterator$ = (function() {
  if ((!$n_sc_Iterator$)) {
    $n_sc_Iterator$ = new $c_sc_Iterator$().init___()
  };
  return $n_sc_Iterator$
});
const $f_sc_TraversableOnce__mkString__T__T__T__T = (function($thiz, start, sep, end) {
  const b = new $c_scm_StringBuilder().init___();
  const this$1 = $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder($thiz, b, start, sep, end);
  return this$1.underlying$5.java$lang$StringBuilder$$content$f
});
const $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function($thiz, b, start, sep, end) {
  const first = new $c_sr_BooleanRef().init___Z(true);
  b.append__T__scm_StringBuilder(start);
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, b$1, sep$1, first$1) {
    return (function(x$2) {
      if (first$1.elem$1) {
        b$1.append__O__scm_StringBuilder(x$2);
        first$1.elem$1 = false;
        return (void 0)
      } else {
        b$1.append__T__scm_StringBuilder(sep$1);
        return b$1.append__O__scm_StringBuilder(x$2)
      }
    })
  })($thiz, b, sep, first)));
  b.append__T__scm_StringBuilder(end);
  return b
});
const $f_sc_TraversableOnce__nonEmpty__Z = (function($thiz) {
  return (!$thiz.isEmpty__Z())
});
class $c_scg_GenMapFactory extends $c_O {
}
class $c_scg_GenericCompanion extends $c_O {
}
class $c_sci_Stream$$hash$colon$colon$ extends $c_O {
  init___() {
    return this
  };
}
const $d_sci_Stream$$hash$colon$colon$ = new $TypeData().initClass({
  sci_Stream$$hash$colon$colon$: 0
}, false, "scala.collection.immutable.Stream$$hash$colon$colon$", {
  sci_Stream$$hash$colon$colon$: 1,
  O: 1
});
$c_sci_Stream$$hash$colon$colon$.prototype.$classData = $d_sci_Stream$$hash$colon$colon$;
let $n_sci_Stream$$hash$colon$colon$ = (void 0);
const $m_sci_Stream$$hash$colon$colon$ = (function() {
  if ((!$n_sci_Stream$$hash$colon$colon$)) {
    $n_sci_Stream$$hash$colon$colon$ = new $c_sci_Stream$$hash$colon$colon$().init___()
  };
  return $n_sci_Stream$$hash$colon$colon$
});
class $c_sjsr_Bits$ extends $c_O {
  constructor() {
    super();
    this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = false;
    this.arrayBuffer$1 = null;
    this.int32Array$1 = null;
    this.float32Array$1 = null;
    this.float64Array$1 = null;
    this.areTypedArraysBigEndian$1 = false;
    this.highOffset$1 = 0;
    this.lowOffset$1 = 0
  };
  init___() {
    $n_sjsr_Bits$ = this;
    this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = true;
    this.arrayBuffer$1 = new $g.ArrayBuffer(8);
    this.int32Array$1 = new $g.Int32Array(this.arrayBuffer$1, 0, 2);
    this.float32Array$1 = new $g.Float32Array(this.arrayBuffer$1, 0, 2);
    this.float64Array$1 = new $g.Float64Array(this.arrayBuffer$1, 0, 1);
    this.int32Array$1[0] = 16909060;
    this.areTypedArraysBigEndian$1 = ((new $g.Int8Array(this.arrayBuffer$1, 0, 8)[0] | 0) === 1);
    this.highOffset$1 = (this.areTypedArraysBigEndian$1 ? 0 : 1);
    this.lowOffset$1 = (this.areTypedArraysBigEndian$1 ? 1 : 0);
    return this
  };
  numberHashCode__D__I(value) {
    const iv = ((value | 0) | 0);
    if (((iv === value) && ((1.0 / value) !== (-Infinity)))) {
      return iv
    } else {
      const t = this.doubleToLongBits__D__J(value);
      const lo = t.lo$2;
      const hi = t.hi$2;
      return (lo ^ hi)
    }
  };
  doubleToLongBits__D__J(value) {
    this.float64Array$1[0] = value;
    const value$1 = (this.int32Array$1[this.highOffset$1] | 0);
    const value$2 = (this.int32Array$1[this.lowOffset$1] | 0);
    return new $c_sjsr_RuntimeLong().init___I__I(value$2, value$1)
  };
}
const $d_sjsr_Bits$ = new $TypeData().initClass({
  sjsr_Bits$: 0
}, false, "scala.scalajs.runtime.Bits$", {
  sjsr_Bits$: 1,
  O: 1
});
$c_sjsr_Bits$.prototype.$classData = $d_sjsr_Bits$;
let $n_sjsr_Bits$ = (void 0);
const $m_sjsr_Bits$ = (function() {
  if ((!$n_sjsr_Bits$)) {
    $n_sjsr_Bits$ = new $c_sjsr_Bits$().init___()
  };
  return $n_sjsr_Bits$
});
class $c_sjsr_RuntimeString$ extends $c_O {
  constructor() {
    super();
    this.CASE$undINSENSITIVE$undORDER$1 = null;
    this.bitmap$0$1 = false
  };
  endsWith__T__T__Z(thiz, suffix) {
    return (thiz.substring((((thiz.length | 0) - (suffix.length | 0)) | 0)) === suffix)
  };
  init___() {
    return this
  };
  indexOf__T__I__I__I(thiz, ch, fromIndex) {
    const str = this.fromCodePoint__p1__I__T(ch);
    return (thiz.indexOf(str, fromIndex) | 0)
  };
  indexOf__T__I__I(thiz, ch) {
    const str = this.fromCodePoint__p1__I__T(ch);
    return (thiz.indexOf(str) | 0)
  };
  fromCodePoint__p1__I__T(codePoint) {
    if ((((-65536) & codePoint) === 0)) {
      return $g.String.fromCharCode(codePoint)
    } else if (((codePoint < 0) || (codePoint > 1114111))) {
      throw new $c_jl_IllegalArgumentException().init___()
    } else {
      const offsetCp = (((-65536) + codePoint) | 0);
      return $g.String.fromCharCode((55296 | (offsetCp >> 10)), (56320 | (1023 & offsetCp)))
    }
  };
  hashCode__T__I(thiz) {
    let res = 0;
    let mul = 1;
    let i = (((-1) + (thiz.length | 0)) | 0);
    while ((i >= 0)) {
      const jsx$1 = res;
      const index = i;
      res = ((jsx$1 + $imul((65535 & (thiz.charCodeAt(index) | 0)), mul)) | 0);
      mul = $imul(31, mul);
      i = (((-1) + i) | 0)
    };
    return res
  };
}
const $d_sjsr_RuntimeString$ = new $TypeData().initClass({
  sjsr_RuntimeString$: 0
}, false, "scala.scalajs.runtime.RuntimeString$", {
  sjsr_RuntimeString$: 1,
  O: 1
});
$c_sjsr_RuntimeString$.prototype.$classData = $d_sjsr_RuntimeString$;
let $n_sjsr_RuntimeString$ = (void 0);
const $m_sjsr_RuntimeString$ = (function() {
  if ((!$n_sjsr_RuntimeString$)) {
    $n_sjsr_RuntimeString$ = new $c_sjsr_RuntimeString$().init___()
  };
  return $n_sjsr_RuntimeString$
});
class $c_sjsr_package$ extends $c_O {
  init___() {
    return this
  };
  unwrapJavaScriptException__jl_Throwable__O(th) {
    if ($is_sjs_js_JavaScriptException(th)) {
      const x2 = th;
      const e = x2.exception$4;
      return e
    } else {
      return th
    }
  };
  wrapJavaScriptException__O__jl_Throwable(e) {
    if ($is_jl_Throwable(e)) {
      const x2 = e;
      return x2
    } else {
      return new $c_sjs_js_JavaScriptException().init___O(e)
    }
  };
}
const $d_sjsr_package$ = new $TypeData().initClass({
  sjsr_package$: 0
}, false, "scala.scalajs.runtime.package$", {
  sjsr_package$: 1,
  O: 1
});
$c_sjsr_package$.prototype.$classData = $d_sjsr_package$;
let $n_sjsr_package$ = (void 0);
const $m_sjsr_package$ = (function() {
  if ((!$n_sjsr_package$)) {
    $n_sjsr_package$ = new $c_sjsr_package$().init___()
  };
  return $n_sjsr_package$
});
const $d_sr_Null$ = new $TypeData().initClass({
  sr_Null$: 0
}, false, "scala.runtime.Null$", {
  sr_Null$: 1,
  O: 1
});
class $c_sr_ScalaRunTime$ extends $c_O {
  init___() {
    return this
  };
  $$undtoString__s_Product__T(x) {
    const this$1 = x.productIterator__sc_Iterator();
    const start = (x.productPrefix__T() + "(");
    return $f_sc_TraversableOnce__mkString__T__T__T__T(this$1, start, ",", ")")
  };
}
const $d_sr_ScalaRunTime$ = new $TypeData().initClass({
  sr_ScalaRunTime$: 0
}, false, "scala.runtime.ScalaRunTime$", {
  sr_ScalaRunTime$: 1,
  O: 1
});
$c_sr_ScalaRunTime$.prototype.$classData = $d_sr_ScalaRunTime$;
let $n_sr_ScalaRunTime$ = (void 0);
const $m_sr_ScalaRunTime$ = (function() {
  if ((!$n_sr_ScalaRunTime$)) {
    $n_sr_ScalaRunTime$ = new $c_sr_ScalaRunTime$().init___()
  };
  return $n_sr_ScalaRunTime$
});
class $c_sr_Statics$ extends $c_O {
  init___() {
    return this
  };
  doubleHash__D__I(dv) {
    const iv = $doubleToInt(dv);
    if ((iv === dv)) {
      return iv
    } else {
      const this$1 = $m_sjsr_RuntimeLong$();
      const lo = this$1.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(dv);
      const hi = this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
      return (($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo, hi) === dv) ? (lo ^ hi) : $m_sjsr_Bits$().numberHashCode__D__I(dv))
    }
  };
  anyHash__O__I(x) {
    if ((x === null)) {
      return 0
    } else if (((typeof x) === "number")) {
      const x3 = (+x);
      return this.doubleHash__D__I(x3)
    } else if ($is_sjsr_RuntimeLong(x)) {
      const t = $uJ(x);
      const lo = t.lo$2;
      const hi = t.hi$2;
      return this.longHash__J__I(new $c_sjsr_RuntimeLong().init___I__I(lo, hi))
    } else {
      return $objectHashCode(x)
    }
  };
  longHash__J__I(lv) {
    const lo = lv.lo$2;
    const lo$1 = lv.hi$2;
    return ((lo$1 === (lo >> 31)) ? lo : (lo ^ lo$1))
  };
}
const $d_sr_Statics$ = new $TypeData().initClass({
  sr_Statics$: 0
}, false, "scala.runtime.Statics$", {
  sr_Statics$: 1,
  O: 1
});
$c_sr_Statics$.prototype.$classData = $d_sr_Statics$;
let $n_sr_Statics$ = (void 0);
const $m_sr_Statics$ = (function() {
  if ((!$n_sr_Statics$)) {
    $n_sr_Statics$ = new $c_sr_Statics$().init___()
  };
  return $n_sr_Statics$
});
class $c_jl_Number extends $c_O {
}
class $c_jl_Throwable extends $c_O {
  constructor() {
    super();
    this.s$1 = null;
    this.e$1 = null;
    this.stackTrace$1 = null
  };
  fillInStackTrace__jl_Throwable() {
    const v = $g.Error.captureStackTrace;
    if ((v === (void 0))) {
      let e$1;
      try {
        e$1 = {}.undef()
      } catch (e) {
        const e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
        if ((e$2 !== null)) {
          if ($is_sjs_js_JavaScriptException(e$2)) {
            const x5 = e$2;
            const e$3 = x5.exception$4;
            e$1 = e$3
          } else {
            throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
          }
        } else {
          throw e
        }
      };
      this.stackdata = e$1
    } else {
      $g.Error.captureStackTrace(this);
      this.stackdata = this
    };
    return this
  };
  getMessage__T() {
    return this.s$1
  };
  toString__T() {
    const className = $objectGetClass(this).getName__T();
    const message = this.getMessage__T();
    return ((message === null) ? className : ((className + ": ") + message))
  };
  init___T__jl_Throwable(s, e) {
    this.s$1 = s;
    this.e$1 = e;
    this.fillInStackTrace__jl_Throwable();
    return this
  };
}
const $is_jl_Throwable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Throwable)))
});
const $isArrayOf_jl_Throwable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Throwable)))
});
class $c_s_Predef$$anon$3 extends $c_O {
  init___() {
    return this
  };
}
const $d_s_Predef$$anon$3 = new $TypeData().initClass({
  s_Predef$$anon$3: 0
}, false, "scala.Predef$$anon$3", {
  s_Predef$$anon$3: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_s_Predef$$anon$3.prototype.$classData = $d_s_Predef$$anon$3;
class $c_s_package$$anon$1 extends $c_O {
  init___() {
    return this
  };
  toString__T() {
    return "object AnyRef"
  };
}
const $d_s_package$$anon$1 = new $TypeData().initClass({
  s_package$$anon$1: 0
}, false, "scala.package$$anon$1", {
  s_package$$anon$1: 1,
  O: 1,
  s_Specializable: 1
});
$c_s_package$$anon$1.prototype.$classData = $d_s_package$$anon$1;
class $c_s_util_hashing_MurmurHash3$ extends $c_s_util_hashing_MurmurHash3 {
  constructor() {
    super();
    this.seqSeed$2 = 0;
    this.mapSeed$2 = 0;
    this.setSeed$2 = 0
  };
  init___() {
    $n_s_util_hashing_MurmurHash3$ = this;
    this.seqSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Seq");
    this.mapSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Map");
    this.setSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Set");
    return this
  };
  seqHash__sc_Seq__I(xs) {
    if ($is_sci_List(xs)) {
      const x2 = xs;
      return this.listHash__sci_List__I__I(x2, this.seqSeed$2)
    } else {
      return this.orderedHash__sc_TraversableOnce__I__I(xs, this.seqSeed$2)
    }
  };
}
const $d_s_util_hashing_MurmurHash3$ = new $TypeData().initClass({
  s_util_hashing_MurmurHash3$: 0
}, false, "scala.util.hashing.MurmurHash3$", {
  s_util_hashing_MurmurHash3$: 1,
  s_util_hashing_MurmurHash3: 1,
  O: 1
});
$c_s_util_hashing_MurmurHash3$.prototype.$classData = $d_s_util_hashing_MurmurHash3$;
let $n_s_util_hashing_MurmurHash3$ = (void 0);
const $m_s_util_hashing_MurmurHash3$ = (function() {
  if ((!$n_s_util_hashing_MurmurHash3$)) {
    $n_s_util_hashing_MurmurHash3$ = new $c_s_util_hashing_MurmurHash3$().init___()
  };
  return $n_s_util_hashing_MurmurHash3$
});
const $f_sc_Iterator__isEmpty__Z = (function($thiz) {
  return (!$thiz.hasNext__Z())
});
const $f_sc_Iterator__toString__T = (function($thiz) {
  return (($thiz.hasNext__Z() ? "non-empty" : "empty") + " iterator")
});
const $f_sc_Iterator__foreach__F1__V = (function($thiz, f) {
  while ($thiz.hasNext__Z()) {
    f.apply__O__O($thiz.next__O())
  }
});
class $c_scg_GenSetFactory extends $c_scg_GenericCompanion {
}
class $c_scg_GenTraversableFactory extends $c_scg_GenericCompanion {
  constructor() {
    super();
    this.ReusableCBFInstance$2 = null
  };
  init___() {
    this.ReusableCBFInstance$2 = new $c_scg_GenTraversableFactory$$anon$1().init___scg_GenTraversableFactory(this);
    return this
  };
}
class $c_scg_GenTraversableFactory$GenericCanBuildFrom extends $c_O {
  constructor() {
    super();
    this.$$outer$1 = null
  };
  init___scg_GenTraversableFactory($$outer) {
    if (($$outer === null)) {
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
    } else {
      this.$$outer$1 = $$outer
    };
    return this
  };
}
class $c_scg_MapFactory extends $c_scg_GenMapFactory {
}
class $c_sci_List$$anon$1 extends $c_O {
  init___() {
    return this
  };
  apply__O__O(x) {
    return this
  };
  toString__T() {
    return "<function1>"
  };
}
const $d_sci_List$$anon$1 = new $TypeData().initClass({
  sci_List$$anon$1: 0
}, false, "scala.collection.immutable.List$$anon$1", {
  sci_List$$anon$1: 1,
  O: 1,
  F1: 1
});
$c_sci_List$$anon$1.prototype.$classData = $d_sci_List$$anon$1;
class $c_sr_AbstractFunction1 extends $c_O {
  toString__T() {
    return "<function1>"
  };
}
class $c_sr_BooleanRef extends $c_O {
  constructor() {
    super();
    this.elem$1 = false
  };
  toString__T() {
    const b = this.elem$1;
    return ("" + b)
  };
  init___Z(elem) {
    this.elem$1 = elem;
    return this
  };
}
const $d_sr_BooleanRef = new $TypeData().initClass({
  sr_BooleanRef: 0
}, false, "scala.runtime.BooleanRef", {
  sr_BooleanRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_BooleanRef.prototype.$classData = $d_sr_BooleanRef;
const $d_sr_BoxedUnit = new $TypeData().initClass({
  sr_BoxedUnit: 0
}, false, "scala.runtime.BoxedUnit", {
  sr_BoxedUnit: 1,
  O: 1,
  Ljava_io_Serializable: 1
}, (void 0), (void 0), (function(x) {
  return (x === (void 0))
}));
class $c_sr_IntRef extends $c_O {
  constructor() {
    super();
    this.elem$1 = 0
  };
  toString__T() {
    const i = this.elem$1;
    return ("" + i)
  };
  init___I(elem) {
    this.elem$1 = elem;
    return this
  };
}
const $d_sr_IntRef = new $TypeData().initClass({
  sr_IntRef: 0
}, false, "scala.runtime.IntRef", {
  sr_IntRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_IntRef.prototype.$classData = $d_sr_IntRef;
const $d_jl_Boolean = new $TypeData().initClass({
  jl_Boolean: 0
}, false, "java.lang.Boolean", {
  jl_Boolean: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "boolean")
}));
class $c_jl_Character extends $c_O {
  constructor() {
    super();
    this.value$1 = 0
  };
  toString__T() {
    const c = this.value$1;
    return $g.String.fromCharCode(c)
  };
  init___C(value) {
    this.value$1 = value;
    return this
  };
  hashCode__I() {
    return this.value$1
  };
}
const $d_jl_Character = new $TypeData().initClass({
  jl_Character: 0
}, false, "java.lang.Character", {
  jl_Character: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_jl_Character.prototype.$classData = $d_jl_Character;
class $c_jl_Double$ extends $c_O {
  constructor() {
    super();
    this.doubleStrPat$1 = null;
    this.bitmap$0$1 = false
  };
  init___() {
    return this
  };
  compare__D__D__I(a, b) {
    if ((a !== a)) {
      return ((b !== b) ? 0 : 1)
    } else if ((b !== b)) {
      return (-1)
    } else if ((a === b)) {
      if ((a === 0.0)) {
        const ainf = (1.0 / a);
        return ((ainf === (1.0 / b)) ? 0 : ((ainf < 0) ? (-1) : 1))
      } else {
        return 0
      }
    } else {
      return ((a < b) ? (-1) : 1)
    }
  };
}
const $d_jl_Double$ = new $TypeData().initClass({
  jl_Double$: 0
}, false, "java.lang.Double$", {
  jl_Double$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Double$.prototype.$classData = $d_jl_Double$;
let $n_jl_Double$ = (void 0);
const $m_jl_Double$ = (function() {
  if ((!$n_jl_Double$)) {
    $n_jl_Double$ = new $c_jl_Double$().init___()
  };
  return $n_jl_Double$
});
class $c_jl_Exception extends $c_jl_Throwable {
}
class $c_s_Predef$ extends $c_s_LowPriorityImplicits {
  constructor() {
    super();
    this.Map$2 = null;
    this.Set$2 = null;
    this.ClassManifest$2 = null;
    this.Manifest$2 = null;
    this.NoManifest$2 = null;
    this.StringCanBuildFrom$2 = null;
    this.singleton$und$less$colon$less$2 = null;
    this.scala$Predef$$singleton$und$eq$colon$eq$f = null
  };
  init___() {
    $n_s_Predef$ = this;
    $m_s_package$();
    $m_sci_List$();
    this.Map$2 = $m_sci_Map$();
    this.Set$2 = $m_sci_Set$();
    this.ClassManifest$2 = $m_s_reflect_package$().ClassManifest$1;
    this.Manifest$2 = $m_s_reflect_package$().Manifest$1;
    this.NoManifest$2 = $m_s_reflect_NoManifest$();
    this.StringCanBuildFrom$2 = new $c_s_Predef$$anon$3().init___();
    this.singleton$und$less$colon$less$2 = new $c_s_Predef$$anon$1().init___();
    this.scala$Predef$$singleton$und$eq$colon$eq$f = new $c_s_Predef$$anon$2().init___();
    return this
  };
  require__Z__V(requirement) {
    if ((!requirement)) {
      throw new $c_jl_IllegalArgumentException().init___T("requirement failed")
    }
  };
}
const $d_s_Predef$ = new $TypeData().initClass({
  s_Predef$: 0
}, false, "scala.Predef$", {
  s_Predef$: 1,
  s_LowPriorityImplicits: 1,
  O: 1,
  s_DeprecatedPredef: 1
});
$c_s_Predef$.prototype.$classData = $d_s_Predef$;
let $n_s_Predef$ = (void 0);
const $m_s_Predef$ = (function() {
  if ((!$n_s_Predef$)) {
    $n_s_Predef$ = new $c_s_Predef$().init___()
  };
  return $n_s_Predef$
});
class $c_s_StringContext$ extends $c_O {
  init___() {
    return this
  };
  treatEscapes0__p1__T__Z__T(str, strict) {
    const len = (str.length | 0);
    const x1 = $m_sjsr_RuntimeString$().indexOf__T__I__I(str, 92);
    switch (x1) {
      case (-1): {
        return str;
        break
      }
      default: {
        return this.replace$1__p1__I__T__Z__I__T(x1, str, strict, len)
      }
    }
  };
  loop$1__p1__I__I__T__Z__I__jl_StringBuilder__T(i, next, str$1, strict$1, len$1, b$1) {
    _loop: while (true) {
      if ((next >= 0)) {
        if ((next > i)) {
          b$1.append__jl_CharSequence__I__I__jl_StringBuilder(str$1, i, next)
        };
        let idx = ((1 + next) | 0);
        if ((idx >= len$1)) {
          throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
        };
        const index = idx;
        const x1 = (65535 & (str$1.charCodeAt(index) | 0));
        let c;
        switch (x1) {
          case 98: {
            c = 8;
            break
          }
          case 116: {
            c = 9;
            break
          }
          case 110: {
            c = 10;
            break
          }
          case 102: {
            c = 12;
            break
          }
          case 114: {
            c = 13;
            break
          }
          case 34: {
            c = 34;
            break
          }
          case 39: {
            c = 39;
            break
          }
          case 92: {
            c = 92;
            break
          }
          default: {
            if (((x1 >= 48) && (x1 <= 55))) {
              if (strict$1) {
                throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
              };
              const index$1 = idx;
              const leadch = (65535 & (str$1.charCodeAt(index$1) | 0));
              let oct = (((-48) + leadch) | 0);
              idx = ((1 + idx) | 0);
              let jsx$2;
              if ((idx < len$1)) {
                const index$2 = idx;
                jsx$2 = ((65535 & (str$1.charCodeAt(index$2) | 0)) >= 48)
              } else {
                jsx$2 = false
              };
              let jsx$1;
              if (jsx$2) {
                const index$3 = idx;
                jsx$1 = ((65535 & (str$1.charCodeAt(index$3) | 0)) <= 55)
              } else {
                jsx$1 = false
              };
              if (jsx$1) {
                const jsx$3 = oct;
                const index$4 = idx;
                oct = (((-48) + (((jsx$3 << 3) + (65535 & (str$1.charCodeAt(index$4) | 0))) | 0)) | 0);
                idx = ((1 + idx) | 0);
                let jsx$5;
                if (((idx < len$1) && (leadch <= 51))) {
                  const index$5 = idx;
                  jsx$5 = ((65535 & (str$1.charCodeAt(index$5) | 0)) >= 48)
                } else {
                  jsx$5 = false
                };
                let jsx$4;
                if (jsx$5) {
                  const index$6 = idx;
                  jsx$4 = ((65535 & (str$1.charCodeAt(index$6) | 0)) <= 55)
                } else {
                  jsx$4 = false
                };
                if (jsx$4) {
                  const jsx$6 = oct;
                  const index$7 = idx;
                  oct = (((-48) + (((jsx$6 << 3) + (65535 & (str$1.charCodeAt(index$7) | 0))) | 0)) | 0);
                  idx = ((1 + idx) | 0)
                }
              };
              idx = (((-1) + idx) | 0);
              c = (65535 & oct)
            } else {
              throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
            }
          }
        };
        idx = ((1 + idx) | 0);
        b$1.append__C__jl_StringBuilder(c);
        const temp$i = idx;
        const temp$next = $m_sjsr_RuntimeString$().indexOf__T__I__I__I(str$1, 92, idx);
        i = temp$i;
        next = temp$next;
        continue _loop
      } else {
        if ((i < len$1)) {
          b$1.append__jl_CharSequence__I__I__jl_StringBuilder(str$1, i, len$1)
        };
        return b$1.java$lang$StringBuilder$$content$f
      }
    }
  };
  replace$1__p1__I__T__Z__I__T(first, str$1, strict$1, len$1) {
    const b = new $c_jl_StringBuilder().init___();
    return this.loop$1__p1__I__I__T__Z__I__jl_StringBuilder__T(0, first, str$1, strict$1, len$1, b)
  };
}
const $d_s_StringContext$ = new $TypeData().initClass({
  s_StringContext$: 0
}, false, "scala.StringContext$", {
  s_StringContext$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext$.prototype.$classData = $d_s_StringContext$;
let $n_s_StringContext$ = (void 0);
const $m_s_StringContext$ = (function() {
  if ((!$n_s_StringContext$)) {
    $n_s_StringContext$ = new $c_s_StringContext$().init___()
  };
  return $n_s_StringContext$
});
class $c_s_math_Fractional$ extends $c_O {
  init___() {
    return this
  };
}
const $d_s_math_Fractional$ = new $TypeData().initClass({
  s_math_Fractional$: 0
}, false, "scala.math.Fractional$", {
  s_math_Fractional$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Fractional$.prototype.$classData = $d_s_math_Fractional$;
let $n_s_math_Fractional$ = (void 0);
const $m_s_math_Fractional$ = (function() {
  if ((!$n_s_math_Fractional$)) {
    $n_s_math_Fractional$ = new $c_s_math_Fractional$().init___()
  };
  return $n_s_math_Fractional$
});
class $c_s_math_Integral$ extends $c_O {
  init___() {
    return this
  };
}
const $d_s_math_Integral$ = new $TypeData().initClass({
  s_math_Integral$: 0
}, false, "scala.math.Integral$", {
  s_math_Integral$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Integral$.prototype.$classData = $d_s_math_Integral$;
let $n_s_math_Integral$ = (void 0);
const $m_s_math_Integral$ = (function() {
  if ((!$n_s_math_Integral$)) {
    $n_s_math_Integral$ = new $c_s_math_Integral$().init___()
  };
  return $n_s_math_Integral$
});
class $c_s_math_Numeric$ extends $c_O {
  init___() {
    return this
  };
}
const $d_s_math_Numeric$ = new $TypeData().initClass({
  s_math_Numeric$: 0
}, false, "scala.math.Numeric$", {
  s_math_Numeric$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Numeric$.prototype.$classData = $d_s_math_Numeric$;
let $n_s_math_Numeric$ = (void 0);
const $m_s_math_Numeric$ = (function() {
  if ((!$n_s_math_Numeric$)) {
    $n_s_math_Numeric$ = new $c_s_math_Numeric$().init___()
  };
  return $n_s_math_Numeric$
});
class $c_s_util_Either$ extends $c_O {
  init___() {
    return this
  };
}
const $d_s_util_Either$ = new $TypeData().initClass({
  s_util_Either$: 0
}, false, "scala.util.Either$", {
  s_util_Either$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Either$.prototype.$classData = $d_s_util_Either$;
let $n_s_util_Either$ = (void 0);
const $m_s_util_Either$ = (function() {
  if ((!$n_s_util_Either$)) {
    $n_s_util_Either$ = new $c_s_util_Either$().init___()
  };
  return $n_s_util_Either$
});
class $c_s_util_Left$ extends $c_O {
  init___() {
    return this
  };
  toString__T() {
    return "Left"
  };
}
const $d_s_util_Left$ = new $TypeData().initClass({
  s_util_Left$: 0
}, false, "scala.util.Left$", {
  s_util_Left$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Left$.prototype.$classData = $d_s_util_Left$;
let $n_s_util_Left$ = (void 0);
const $m_s_util_Left$ = (function() {
  if ((!$n_s_util_Left$)) {
    $n_s_util_Left$ = new $c_s_util_Left$().init___()
  };
  return $n_s_util_Left$
});
class $c_s_util_Right$ extends $c_O {
  init___() {
    return this
  };
  toString__T() {
    return "Right"
  };
}
const $d_s_util_Right$ = new $TypeData().initClass({
  s_util_Right$: 0
}, false, "scala.util.Right$", {
  s_util_Right$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Right$.prototype.$classData = $d_s_util_Right$;
let $n_s_util_Right$ = (void 0);
const $m_s_util_Right$ = (function() {
  if ((!$n_s_util_Right$)) {
    $n_s_util_Right$ = new $c_s_util_Right$().init___()
  };
  return $n_s_util_Right$
});
class $c_s_util_control_NoStackTrace$ extends $c_O {
  constructor() {
    super();
    this.$$undnoSuppression$1 = false
  };
  init___() {
    this.$$undnoSuppression$1 = false;
    return this
  };
}
const $d_s_util_control_NoStackTrace$ = new $TypeData().initClass({
  s_util_control_NoStackTrace$: 0
}, false, "scala.util.control.NoStackTrace$", {
  s_util_control_NoStackTrace$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_control_NoStackTrace$.prototype.$classData = $d_s_util_control_NoStackTrace$;
let $n_s_util_control_NoStackTrace$ = (void 0);
const $m_s_util_control_NoStackTrace$ = (function() {
  if ((!$n_s_util_control_NoStackTrace$)) {
    $n_s_util_control_NoStackTrace$ = new $c_s_util_control_NoStackTrace$().init___()
  };
  return $n_s_util_control_NoStackTrace$
});
class $c_sc_IndexedSeq$$anon$1 extends $c_scg_GenTraversableFactory$GenericCanBuildFrom {
  init___() {
    $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $m_sc_IndexedSeq$());
    return this
  };
}
const $d_sc_IndexedSeq$$anon$1 = new $TypeData().initClass({
  sc_IndexedSeq$$anon$1: 0
}, false, "scala.collection.IndexedSeq$$anon$1", {
  sc_IndexedSeq$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_sc_IndexedSeq$$anon$1.prototype.$classData = $d_sc_IndexedSeq$$anon$1;
class $c_scg_GenSeqFactory extends $c_scg_GenTraversableFactory {
}
class $c_scg_GenTraversableFactory$$anon$1 extends $c_scg_GenTraversableFactory$GenericCanBuildFrom {
  constructor() {
    super();
    this.$$outer$2 = null
  };
  init___scg_GenTraversableFactory($$outer) {
    if (($$outer === null)) {
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
    } else {
      this.$$outer$2 = $$outer
    };
    $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $$outer);
    return this
  };
}
const $d_scg_GenTraversableFactory$$anon$1 = new $TypeData().initClass({
  scg_GenTraversableFactory$$anon$1: 0
}, false, "scala.collection.generic.GenTraversableFactory$$anon$1", {
  scg_GenTraversableFactory$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_scg_GenTraversableFactory$$anon$1.prototype.$classData = $d_scg_GenTraversableFactory$$anon$1;
class $c_scg_ImmutableMapFactory extends $c_scg_MapFactory {
}
class $c_sci_$colon$colon$ extends $c_O {
  init___() {
    return this
  };
  toString__T() {
    return "::"
  };
}
const $d_sci_$colon$colon$ = new $TypeData().initClass({
  sci_$colon$colon$: 0
}, false, "scala.collection.immutable.$colon$colon$", {
  sci_$colon$colon$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_$colon$colon$.prototype.$classData = $d_sci_$colon$colon$;
let $n_sci_$colon$colon$ = (void 0);
const $m_sci_$colon$colon$ = (function() {
  if ((!$n_sci_$colon$colon$)) {
    $n_sci_$colon$colon$ = new $c_sci_$colon$colon$().init___()
  };
  return $n_sci_$colon$colon$
});
class $c_sci_Range$ extends $c_O {
  constructor() {
    super();
    this.MAX$undPRINT$1 = 0
  };
  init___() {
    this.MAX$undPRINT$1 = 512;
    return this
  };
}
const $d_sci_Range$ = new $TypeData().initClass({
  sci_Range$: 0
}, false, "scala.collection.immutable.Range$", {
  sci_Range$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Range$.prototype.$classData = $d_sci_Range$;
let $n_sci_Range$ = (void 0);
const $m_sci_Range$ = (function() {
  if ((!$n_sci_Range$)) {
    $n_sci_Range$ = new $c_sci_Range$().init___()
  };
  return $n_sci_Range$
});
class $c_scm_StringBuilder$ extends $c_O {
  init___() {
    return this
  };
}
const $d_scm_StringBuilder$ = new $TypeData().initClass({
  scm_StringBuilder$: 0
}, false, "scala.collection.mutable.StringBuilder$", {
  scm_StringBuilder$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder$.prototype.$classData = $d_scm_StringBuilder$;
let $n_scm_StringBuilder$ = (void 0);
const $m_scm_StringBuilder$ = (function() {
  if ((!$n_scm_StringBuilder$)) {
    $n_scm_StringBuilder$ = new $c_scm_StringBuilder$().init___()
  };
  return $n_scm_StringBuilder$
});
class $c_sjsr_AnonFunction1 extends $c_sr_AbstractFunction1 {
  constructor() {
    super();
    this.f$2 = null
  };
  apply__O__O(arg1) {
    return (0, this.f$2)(arg1)
  };
  init___sjs_js_Function1(f) {
    this.f$2 = f;
    return this
  };
}
const $d_sjsr_AnonFunction1 = new $TypeData().initClass({
  sjsr_AnonFunction1: 0
}, false, "scala.scalajs.runtime.AnonFunction1", {
  sjsr_AnonFunction1: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1
});
$c_sjsr_AnonFunction1.prototype.$classData = $d_sjsr_AnonFunction1;
class $c_sjsr_RuntimeLong$ extends $c_O {
  constructor() {
    super();
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
    this.Zero$1 = null
  };
  init___() {
    $n_sjsr_RuntimeLong$ = this;
    this.Zero$1 = new $c_sjsr_RuntimeLong().init___I__I(0, 0);
    return this
  };
  Zero__sjsr_RuntimeLong() {
    return this.Zero$1
  };
  toUnsignedString__p1__I__I__T(lo, hi) {
    if ((((-2097152) & hi) === 0)) {
      const this$5 = ((4.294967296E9 * hi) + (+(lo >>> 0)));
      return ("" + this$5)
    } else {
      return this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(lo, hi, 1000000000, 0, 2)
    }
  };
  divideImpl__I__I__I__I__I(alo, ahi, blo, bhi) {
    if (((blo | bhi) === 0)) {
      throw new $c_jl_ArithmeticException().init___T("/ by zero")
    };
    if ((ahi === (alo >> 31))) {
      if ((bhi === (blo >> 31))) {
        if (((alo === (-2147483648)) && (blo === (-1)))) {
          this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
          return (-2147483648)
        } else {
          const lo = ((alo / blo) | 0);
          this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (lo >> 31);
          return lo
        }
      } else if (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0)))) {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (-1);
        return (-1)
      } else {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return 0
      }
    } else {
      const neg = (ahi < 0);
      let abs_$_lo$2;
      let abs_$_hi$2;
      if (neg) {
        const lo$1 = ((-alo) | 0);
        const hi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0));
        const jsx$1_$_lo$2 = lo$1;
        const jsx$1_$_hi$2 = hi;
        abs_$_lo$2 = jsx$1_$_lo$2;
        abs_$_hi$2 = jsx$1_$_hi$2
      } else {
        const jsx$2_$_lo$2 = alo;
        const jsx$2_$_hi$2 = ahi;
        abs_$_lo$2 = jsx$2_$_lo$2;
        abs_$_hi$2 = jsx$2_$_hi$2
      };
      const neg$1 = (bhi < 0);
      let abs$1_$_lo$2;
      let abs$1_$_hi$2;
      if (neg$1) {
        const lo$2 = ((-blo) | 0);
        const hi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0));
        const jsx$3_$_lo$2 = lo$2;
        const jsx$3_$_hi$2 = hi$1;
        abs$1_$_lo$2 = jsx$3_$_lo$2;
        abs$1_$_hi$2 = jsx$3_$_hi$2
      } else {
        const jsx$4_$_lo$2 = blo;
        const jsx$4_$_hi$2 = bhi;
        abs$1_$_lo$2 = jsx$4_$_lo$2;
        abs$1_$_hi$2 = jsx$4_$_hi$2
      };
      const absRLo = this.unsigned$und$div__p1__I__I__I__I__I(abs_$_lo$2, abs_$_hi$2, abs$1_$_lo$2, abs$1_$_hi$2);
      if ((neg === neg$1)) {
        return absRLo
      } else {
        const hi$2 = this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((absRLo !== 0) ? (~hi$2) : ((-hi$2) | 0));
        return ((-absRLo) | 0)
      }
    }
  };
  scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo, hi) {
    if ((hi < 0)) {
      const x = ((lo !== 0) ? (~hi) : ((-hi) | 0));
      const x$1 = ((-lo) | 0);
      return (-((4.294967296E9 * (+(x >>> 0))) + (+(x$1 >>> 0))))
    } else {
      return ((4.294967296E9 * hi) + (+(lo >>> 0)))
    }
  };
  fromDouble__D__sjsr_RuntimeLong(value) {
    const lo = this.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(value);
    return new $c_sjsr_RuntimeLong().init___I__I(lo, this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
  };
  scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(value) {
    if ((value < (-9.223372036854776E18))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (-2147483648);
      return 0
    } else if ((value >= 9.223372036854776E18)) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 2147483647;
      return (-1)
    } else {
      const rawLo = ((value | 0) | 0);
      const x = (value / 4.294967296E9);
      const rawHi = ((x | 0) | 0);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (((value < 0) && (rawLo !== 0)) ? (((-1) + rawHi) | 0) : rawHi);
      return rawLo
    }
  };
  unsigned$und$div__p1__I__I__I__I__I(alo, ahi, blo, bhi) {
    if ((((-2097152) & ahi) === 0)) {
      if ((((-2097152) & bhi) === 0)) {
        const aDouble = ((4.294967296E9 * ahi) + (+(alo >>> 0)));
        const bDouble = ((4.294967296E9 * bhi) + (+(blo >>> 0)));
        const rDouble = (aDouble / bDouble);
        const x = (rDouble / 4.294967296E9);
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((x | 0) | 0);
        return ((rDouble | 0) | 0)
      } else {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return 0
      }
    } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
      const pow = ((31 - $clz32(blo)) | 0);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((ahi >>> pow) | 0);
      return (((alo >>> pow) | 0) | ((ahi << 1) << ((31 - pow) | 0)))
    } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
      const pow$2 = ((31 - $clz32(bhi)) | 0);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return ((ahi >>> pow$2) | 0)
    } else {
      return (this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 0) | 0)
    }
  };
  scala$scalajs$runtime$RuntimeLong$$toString__I__I__T(lo, hi) {
    return ((hi === (lo >> 31)) ? ("" + lo) : ((hi < 0) ? ("-" + this.toUnsignedString__p1__I__I__T(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))) : this.toUnsignedString__p1__I__I__T(lo, hi)))
  };
  scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(alo, ahi, blo, bhi) {
    return ((ahi === bhi) ? ((alo === blo) ? 0 : ((((-2147483648) ^ alo) < ((-2147483648) ^ blo)) ? (-1) : 1)) : ((ahi < bhi) ? (-1) : 1))
  };
  unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, ask) {
    let shift = ((((bhi !== 0) ? $clz32(bhi) : ((32 + $clz32(blo)) | 0)) - ((ahi !== 0) ? $clz32(ahi) : ((32 + $clz32(alo)) | 0))) | 0);
    const n = shift;
    const lo = (((32 & n) === 0) ? (blo << n) : 0);
    const hi = (((32 & n) === 0) ? (((((blo >>> 1) | 0) >>> ((31 - n) | 0)) | 0) | (bhi << n)) : (blo << n));
    let bShiftLo = lo;
    let bShiftHi = hi;
    let remLo = alo;
    let remHi = ahi;
    let quotLo = 0;
    let quotHi = 0;
    while (((shift >= 0) && (((-2097152) & remHi) !== 0))) {
      const alo$1 = remLo;
      const ahi$1 = remHi;
      const blo$1 = bShiftLo;
      const bhi$1 = bShiftHi;
      if (((ahi$1 === bhi$1) ? (((-2147483648) ^ alo$1) >= ((-2147483648) ^ blo$1)) : (((-2147483648) ^ ahi$1) >= ((-2147483648) ^ bhi$1)))) {
        const lo$1 = remLo;
        const hi$1 = remHi;
        const lo$2 = bShiftLo;
        const hi$2 = bShiftHi;
        const lo$3 = ((lo$1 - lo$2) | 0);
        const hi$3 = ((((-2147483648) ^ lo$3) > ((-2147483648) ^ lo$1)) ? (((-1) + ((hi$1 - hi$2) | 0)) | 0) : ((hi$1 - hi$2) | 0));
        remLo = lo$3;
        remHi = hi$3;
        if ((shift < 32)) {
          quotLo = (quotLo | (1 << shift))
        } else {
          quotHi = (quotHi | (1 << shift))
        }
      };
      shift = (((-1) + shift) | 0);
      const lo$4 = bShiftLo;
      const hi$4 = bShiftHi;
      const lo$5 = (((lo$4 >>> 1) | 0) | (hi$4 << 31));
      const hi$5 = ((hi$4 >>> 1) | 0);
      bShiftLo = lo$5;
      bShiftHi = hi$5
    };
    const alo$2 = remLo;
    const ahi$2 = remHi;
    if (((ahi$2 === bhi) ? (((-2147483648) ^ alo$2) >= ((-2147483648) ^ blo)) : (((-2147483648) ^ ahi$2) >= ((-2147483648) ^ bhi)))) {
      const lo$6 = remLo;
      const hi$6 = remHi;
      const remDouble = ((4.294967296E9 * hi$6) + (+(lo$6 >>> 0)));
      const bDouble = ((4.294967296E9 * bhi) + (+(blo >>> 0)));
      if ((ask !== 1)) {
        const x = (remDouble / bDouble);
        const lo$7 = ((x | 0) | 0);
        const x$1 = (x / 4.294967296E9);
        const hi$7 = ((x$1 | 0) | 0);
        const lo$8 = quotLo;
        const hi$8 = quotHi;
        const lo$9 = ((lo$8 + lo$7) | 0);
        const hi$9 = ((((-2147483648) ^ lo$9) < ((-2147483648) ^ lo$8)) ? ((1 + ((hi$8 + hi$7) | 0)) | 0) : ((hi$8 + hi$7) | 0));
        quotLo = lo$9;
        quotHi = hi$9
      };
      if ((ask !== 0)) {
        const rem_mod_bDouble = (remDouble % bDouble);
        remLo = ((rem_mod_bDouble | 0) | 0);
        const x$2 = (rem_mod_bDouble / 4.294967296E9);
        remHi = ((x$2 | 0) | 0)
      }
    };
    if ((ask === 0)) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = quotHi;
      const a = quotLo;
      return a
    } else if ((ask === 1)) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = remHi;
      const a$1 = remLo;
      return a$1
    } else {
      const lo$10 = quotLo;
      const hi$10 = quotHi;
      const quot = ((4.294967296E9 * hi$10) + (+(lo$10 >>> 0)));
      const this$25 = remLo;
      const remStr = ("" + this$25);
      const a$2 = ((("" + quot) + "000000000".substring((remStr.length | 0))) + remStr);
      return a$2
    }
  };
  remainderImpl__I__I__I__I__I(alo, ahi, blo, bhi) {
    if (((blo | bhi) === 0)) {
      throw new $c_jl_ArithmeticException().init___T("/ by zero")
    };
    if ((ahi === (alo >> 31))) {
      if ((bhi === (blo >> 31))) {
        if ((blo !== (-1))) {
          const lo = ((alo % blo) | 0);
          this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (lo >> 31);
          return lo
        } else {
          this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
          return 0
        }
      } else if (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0)))) {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return 0
      } else {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ahi;
        return alo
      }
    } else {
      const neg = (ahi < 0);
      let abs_$_lo$2;
      let abs_$_hi$2;
      if (neg) {
        const lo$1 = ((-alo) | 0);
        const hi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0));
        const jsx$1_$_lo$2 = lo$1;
        const jsx$1_$_hi$2 = hi;
        abs_$_lo$2 = jsx$1_$_lo$2;
        abs_$_hi$2 = jsx$1_$_hi$2
      } else {
        const jsx$2_$_lo$2 = alo;
        const jsx$2_$_hi$2 = ahi;
        abs_$_lo$2 = jsx$2_$_lo$2;
        abs_$_hi$2 = jsx$2_$_hi$2
      };
      const neg$1 = (bhi < 0);
      let abs$1_$_lo$2;
      let abs$1_$_hi$2;
      if (neg$1) {
        const lo$2 = ((-blo) | 0);
        const hi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0));
        const jsx$3_$_lo$2 = lo$2;
        const jsx$3_$_hi$2 = hi$1;
        abs$1_$_lo$2 = jsx$3_$_lo$2;
        abs$1_$_hi$2 = jsx$3_$_hi$2
      } else {
        const jsx$4_$_lo$2 = blo;
        const jsx$4_$_hi$2 = bhi;
        abs$1_$_lo$2 = jsx$4_$_lo$2;
        abs$1_$_hi$2 = jsx$4_$_hi$2
      };
      const absRLo = this.unsigned$und$percent__p1__I__I__I__I__I(abs_$_lo$2, abs_$_hi$2, abs$1_$_lo$2, abs$1_$_hi$2);
      if (neg) {
        const hi$2 = this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((absRLo !== 0) ? (~hi$2) : ((-hi$2) | 0));
        return ((-absRLo) | 0)
      } else {
        return absRLo
      }
    }
  };
  unsigned$und$percent__p1__I__I__I__I__I(alo, ahi, blo, bhi) {
    if ((((-2097152) & ahi) === 0)) {
      if ((((-2097152) & bhi) === 0)) {
        const aDouble = ((4.294967296E9 * ahi) + (+(alo >>> 0)));
        const bDouble = ((4.294967296E9 * bhi) + (+(blo >>> 0)));
        const rDouble = (aDouble % bDouble);
        const x = (rDouble / 4.294967296E9);
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((x | 0) | 0);
        return ((rDouble | 0) | 0)
      } else {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ahi;
        return alo
      }
    } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return (alo & (((-1) + blo) | 0))
    } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (ahi & (((-1) + bhi) | 0));
      return alo
    } else {
      return (this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 1) | 0)
    }
  };
}
const $d_sjsr_RuntimeLong$ = new $TypeData().initClass({
  sjsr_RuntimeLong$: 0
}, false, "scala.scalajs.runtime.RuntimeLong$", {
  sjsr_RuntimeLong$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sjsr_RuntimeLong$.prototype.$classData = $d_sjsr_RuntimeLong$;
let $n_sjsr_RuntimeLong$ = (void 0);
const $m_sjsr_RuntimeLong$ = (function() {
  if ((!$n_sjsr_RuntimeLong$)) {
    $n_sjsr_RuntimeLong$ = new $c_sjsr_RuntimeLong$().init___()
  };
  return $n_sjsr_RuntimeLong$
});
const $d_sr_Nothing$ = new $TypeData().initClass({
  sr_Nothing$: 0
}, false, "scala.runtime.Nothing$", {
  sr_Nothing$: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__getLanguageName__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T = (function($this) {
  return "Scala"
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__busySignal__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_BusySignal = (function($this) {
  return $this.busySignal$3
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__preInitialization__Llaughedelic_atom_ide_scala_ScalaLanguageClient__sjs_js_Any__V = (function($this, connection) {
  $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__busySignal__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_BusySignal($this).update__T__Z__Z__V("initializing language server...", true, false)
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__startServerProcess__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T__Lio_scalajs_nodejs_child$undprocess_ChildProcess = (function($this, projectPath) {
  const jsx$1 = $g.console;
  const s = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["startServerProcess(", ")"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([projectPath]));
  jsx$1.log(s);
  const thiz = $objectToString($i_child$005fprocess.execSync("/usr/libexec/java_home"));
  const javaHome = thiz.trim();
  const toolsJar = $i_path.join(javaHome, "lib", "tools.jar");
  const coursierJar = $i_path.join($i_os.homedir(), "bin", "coursier");
  const coursierArgs = ["launch", "--quiet", "--repository", "bintray:dhpcs/maven", "--repository", "sonatype:releases", "--extra-jars", toolsJar, "org.scalameta:metaserver_2.12:0.1-SNAPSHOT", "--main", "scala.meta.languageserver.Main"];
  const javaBin = $i_path.join(javaHome, "bin", "java");
  const javaArgs = [new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["-Dvscode.workspace=", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([projectPath])), "-jar", coursierJar].concat(coursierArgs);
  const jsx$2 = $g.console;
  const b = new $c_scm_StringBuilder().init___();
  let elem$1 = false;
  elem$1 = true;
  b.append__T__scm_StringBuilder(javaBin);
  let i = 0;
  const len = (javaArgs.length | 0);
  while ((i < len)) {
    const index = i;
    const arg1 = javaArgs[index];
    if (elem$1) {
      b.append__O__scm_StringBuilder(arg1);
      elem$1 = false
    } else {
      b.append__T__scm_StringBuilder("\n");
      b.append__O__scm_StringBuilder(arg1)
    };
    i = ((1 + i) | 0)
  };
  b.append__T__scm_StringBuilder("");
  const s$1 = b.underlying$5.java$lang$StringBuilder$$content$f;
  jsx$2.log(s$1);
  const serverProcess = $i_child$005fprocess.spawn(javaBin, javaArgs);
  $this.captureServerErrors(serverProcess);
  serverProcess.on("exit", (function(this$2$1) {
    return (function(err$2) {
      const this$11 = $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__busySignal__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_BusySignal(this$2$1);
      this$11.update__T__Z__Z__V("", false, false);
      const s$2 = this$2$1.processStdErr;
      this$2$1.handleSpawnFailure(s$2)
    })
  })($this));
  return serverProcess
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__getGrammarScopes__Llaughedelic_atom_ide_scala_ScalaLanguageClient__sjs_js_Array = (function($this) {
  return ["source.scala"]
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__busySignal$und$eq__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_BusySignal__V = (function($this, x$1) {
  $this.busySignal$3 = x$1
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__postInitialization__Llaughedelic_atom_ide_scala_ScalaLanguageClient__sjs_js_Any__V = (function($this, server) {
  const this$1 = $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__busySignal__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_BusySignal($this);
  this$1.update__T__Z__Z__V("", false, false)
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__getServerName__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T = (function($this) {
  return "Scalameta"
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__consumeBusySignal__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_facade_atom$undide_busy$undsignal_BusySignalService__V = (function($this, service) {
  $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__busySignal$und$eq__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_BusySignal__V($this, new $c_Llaughedelic_atom_ide_scala_BusySignal().init___Llaughedelic_atom_ide_scala_facade_atom$undide_busy$undsignal_BusySignalService__T(service, $this.getServerName()))
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__filterChangeWatchedFiles__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T__Z = (function($this, filePath) {
  return ($m_sjsr_RuntimeString$().endsWith__T__T__Z(filePath, ".semanticdb") || $m_sjsr_RuntimeString$().endsWith__T__T__Z(filePath, ".compilerconfig"))
});
let $b_Llaughedelic_atom_ide_scala_ScalaLanguageClient = (void 0);
const $a_Llaughedelic_atom_ide_scala_ScalaLanguageClient = (function() {
  if ((!$b_Llaughedelic_atom_ide_scala_ScalaLanguageClient)) {
    class $c_Llaughedelic_atom_ide_scala_ScalaLanguageClient extends $i_atom$002dlanguageclient.AutoLanguageClient {
      constructor() {
        super();
        $g.Object.defineProperties(this, {
          busySignal$3: {
            "configurable": true,
            "enumerable": true,
            "writable": true,
            "value": null
          }
        });
        this.busySignal$3 = null
      };
      "getGrammarScopes"() {
        return $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__getGrammarScopes__Llaughedelic_atom_ide_scala_ScalaLanguageClient__sjs_js_Array(this)
      };
      "getLanguageName"() {
        return $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__getLanguageName__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T(this)
      };
      "getServerName"() {
        return $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__getServerName__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T(this)
      };
      "startServerProcess"(arg$1) {
        const prep0 = arg$1;
        return $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__startServerProcess__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T__Lio_scalajs_nodejs_child$undprocess_ChildProcess(this, prep0)
      };
      "filterChangeWatchedFiles"(arg$1) {
        const prep0 = arg$1;
        return $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__filterChangeWatchedFiles__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T__Z(this, prep0)
      };
      "preInitialization"(arg$1) {
        const prep0 = arg$1;
        $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__preInitialization__Llaughedelic_atom_ide_scala_ScalaLanguageClient__sjs_js_Any__V(this, prep0)
      };
      "postInitialization"(arg$1) {
        const prep0 = arg$1;
        $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__postInitialization__Llaughedelic_atom_ide_scala_ScalaLanguageClient__sjs_js_Any__V(this, prep0)
      };
      "consumeBusySignal"(arg$1) {
        const prep0 = arg$1;
        $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__consumeBusySignal__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_facade_atom$undide_busy$undsignal_BusySignalService__V(this, prep0)
      };
    }
    $b_Llaughedelic_atom_ide_scala_ScalaLanguageClient = $c_Llaughedelic_atom_ide_scala_ScalaLanguageClient
  };
  return $b_Llaughedelic_atom_ide_scala_ScalaLanguageClient
});
const $is_T = (function(obj) {
  return ((typeof obj) === "string")
});
const $isArrayOf_T = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T)))
});
const $d_T = new $TypeData().initClass({
  T: 0
}, false, "java.lang.String", {
  T: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_CharSequence: 1,
  jl_Comparable: 1
}, (void 0), (void 0), $is_T);
const $d_jl_Byte = new $TypeData().initClass({
  jl_Byte: 0
}, false, "java.lang.Byte", {
  jl_Byte: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isByte(x)
}));
class $c_jl_CloneNotSupportedException extends $c_jl_Exception {
  init___() {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
    return this
  };
}
const $d_jl_CloneNotSupportedException = new $TypeData().initClass({
  jl_CloneNotSupportedException: 0
}, false, "java.lang.CloneNotSupportedException", {
  jl_CloneNotSupportedException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_CloneNotSupportedException.prototype.$classData = $d_jl_CloneNotSupportedException;
const $isArrayOf_jl_Double = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double)))
});
const $d_jl_Double = new $TypeData().initClass({
  jl_Double: 0
}, false, "java.lang.Double", {
  jl_Double: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "number")
}));
const $d_jl_Float = new $TypeData().initClass({
  jl_Float: 0
}, false, "java.lang.Float", {
  jl_Float: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isFloat(x)
}));
const $d_jl_Integer = new $TypeData().initClass({
  jl_Integer: 0
}, false, "java.lang.Integer", {
  jl_Integer: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isInt(x)
}));
const $isArrayOf_jl_Long = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long)))
});
const $d_jl_Long = new $TypeData().initClass({
  jl_Long: 0
}, false, "java.lang.Long", {
  jl_Long: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $is_sjsr_RuntimeLong(x)
}));
class $c_jl_RuntimeException extends $c_jl_Exception {
}
const $d_jl_Short = new $TypeData().initClass({
  jl_Short: 0
}, false, "java.lang.Short", {
  jl_Short: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isShort(x)
}));
class $c_jl_StringBuilder extends $c_O {
  constructor() {
    super();
    this.java$lang$StringBuilder$$content$f = null
  };
  init___() {
    this.java$lang$StringBuilder$$content$f = "";
    return this
  };
  subSequence__I__I__jl_CharSequence(start, end) {
    return this.substring__I__I__T(start, end)
  };
  toString__T() {
    return this.java$lang$StringBuilder$$content$f
  };
  init___I(initialCapacity) {
    $c_jl_StringBuilder.prototype.init___.call(this);
    if ((initialCapacity < 0)) {
      throw new $c_jl_NegativeArraySizeException().init___()
    };
    return this
  };
  append__jl_CharSequence__I__I__jl_StringBuilder(s, start, end) {
    const s$1 = $charSequenceSubSequence(((s === null) ? "null" : s), start, end);
    this.java$lang$StringBuilder$$content$f = (("" + this.java$lang$StringBuilder$$content$f) + s$1);
    return this
  };
  length__I() {
    const thiz = this.java$lang$StringBuilder$$content$f;
    return (thiz.length | 0)
  };
  append__C__jl_StringBuilder(c) {
    const str = $g.String.fromCharCode(c);
    this.java$lang$StringBuilder$$content$f = (("" + this.java$lang$StringBuilder$$content$f) + str);
    return this
  };
  substring__I__I__T(start, end) {
    const thiz = this.java$lang$StringBuilder$$content$f;
    return thiz.substring(start, end)
  };
  init___T(str) {
    $c_jl_StringBuilder.prototype.init___.call(this);
    if ((str === null)) {
      throw new $c_jl_NullPointerException().init___()
    };
    this.java$lang$StringBuilder$$content$f = str;
    return this
  };
  charAt__I__C(index) {
    const thiz = this.java$lang$StringBuilder$$content$f;
    return (65535 & (thiz.charCodeAt(index) | 0))
  };
}
const $d_jl_StringBuilder = new $TypeData().initClass({
  jl_StringBuilder: 0
}, false, "java.lang.StringBuilder", {
  jl_StringBuilder: 1,
  O: 1,
  jl_CharSequence: 1,
  jl_Appendable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_StringBuilder.prototype.$classData = $d_jl_StringBuilder;
class $c_s_Predef$$eq$colon$eq extends $c_O {
  toString__T() {
    return "<function1>"
  };
}
class $c_s_Predef$$less$colon$less extends $c_O {
  toString__T() {
    return "<function1>"
  };
}
class $c_s_math_Equiv$ extends $c_O {
  init___() {
    return this
  };
}
const $d_s_math_Equiv$ = new $TypeData().initClass({
  s_math_Equiv$: 0
}, false, "scala.math.Equiv$", {
  s_math_Equiv$: 1,
  O: 1,
  s_math_LowPriorityEquiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Equiv$.prototype.$classData = $d_s_math_Equiv$;
let $n_s_math_Equiv$ = (void 0);
const $m_s_math_Equiv$ = (function() {
  if ((!$n_s_math_Equiv$)) {
    $n_s_math_Equiv$ = new $c_s_math_Equiv$().init___()
  };
  return $n_s_math_Equiv$
});
class $c_s_math_Ordering$ extends $c_O {
  init___() {
    return this
  };
}
const $d_s_math_Ordering$ = new $TypeData().initClass({
  s_math_Ordering$: 0
}, false, "scala.math.Ordering$", {
  s_math_Ordering$: 1,
  O: 1,
  s_math_LowPriorityOrderingImplicits: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Ordering$.prototype.$classData = $d_s_math_Ordering$;
let $n_s_math_Ordering$ = (void 0);
const $m_s_math_Ordering$ = (function() {
  if ((!$n_s_math_Ordering$)) {
    $n_s_math_Ordering$ = new $c_s_math_Ordering$().init___()
  };
  return $n_s_math_Ordering$
});
class $c_s_reflect_NoManifest$ extends $c_O {
  init___() {
    return this
  };
  toString__T() {
    return "<?>"
  };
}
const $d_s_reflect_NoManifest$ = new $TypeData().initClass({
  s_reflect_NoManifest$: 0
}, false, "scala.reflect.NoManifest$", {
  s_reflect_NoManifest$: 1,
  O: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_reflect_NoManifest$.prototype.$classData = $d_s_reflect_NoManifest$;
let $n_s_reflect_NoManifest$ = (void 0);
const $m_s_reflect_NoManifest$ = (function() {
  if ((!$n_s_reflect_NoManifest$)) {
    $n_s_reflect_NoManifest$ = new $c_s_reflect_NoManifest$().init___()
  };
  return $n_s_reflect_NoManifest$
});
class $c_sc_AbstractIterator extends $c_O {
  isEmpty__Z() {
    return $f_sc_Iterator__isEmpty__Z(this)
  };
  toString__T() {
    return $f_sc_Iterator__toString__T(this)
  };
  foreach__F1__V(f) {
    $f_sc_Iterator__foreach__F1__V(this, f)
  };
}
class $c_scg_SetFactory extends $c_scg_GenSetFactory {
}
class $c_sci_Map$ extends $c_scg_ImmutableMapFactory {
  init___() {
    return this
  };
}
const $d_sci_Map$ = new $TypeData().initClass({
  sci_Map$: 0
}, false, "scala.collection.immutable.Map$", {
  sci_Map$: 1,
  scg_ImmutableMapFactory: 1,
  scg_MapFactory: 1,
  scg_GenMapFactory: 1,
  O: 1
});
$c_sci_Map$.prototype.$classData = $d_sci_Map$;
let $n_sci_Map$ = (void 0);
const $m_sci_Map$ = (function() {
  if ((!$n_sci_Map$)) {
    $n_sci_Map$ = new $c_sci_Map$().init___()
  };
  return $n_sci_Map$
});
class $c_sjsr_RuntimeLong extends $c_jl_Number {
  constructor() {
    super();
    this.lo$2 = 0;
    this.hi$2 = 0
  };
  longValue__J() {
    return $uJ(this)
  };
  $$bar__sjsr_RuntimeLong__sjsr_RuntimeLong(b) {
    return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 | b.lo$2), (this.hi$2 | b.hi$2))
  };
  $$greater$eq__sjsr_RuntimeLong__Z(b) {
    const ahi = this.hi$2;
    const bhi = b.hi$2;
    return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) >= ((-2147483648) ^ b.lo$2)) : (ahi > bhi))
  };
  byteValue__B() {
    return ((this.lo$2 << 24) >> 24)
  };
  equals__O__Z(that) {
    if ($is_sjsr_RuntimeLong(that)) {
      const x2 = that;
      return ((this.lo$2 === x2.lo$2) && (this.hi$2 === x2.hi$2))
    } else {
      return false
    }
  };
  $$less__sjsr_RuntimeLong__Z(b) {
    const ahi = this.hi$2;
    const bhi = b.hi$2;
    return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) < ((-2147483648) ^ b.lo$2)) : (ahi < bhi))
  };
  $$times__sjsr_RuntimeLong__sjsr_RuntimeLong(b) {
    const alo = this.lo$2;
    const blo = b.lo$2;
    const a0 = (65535 & alo);
    const a1 = ((alo >>> 16) | 0);
    const b0 = (65535 & blo);
    const b1 = ((blo >>> 16) | 0);
    const a0b0 = $imul(a0, b0);
    const a1b0 = $imul(a1, b0);
    const a0b1 = $imul(a0, b1);
    const lo = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
    const c1part = ((((a0b0 >>> 16) | 0) + a0b1) | 0);
    const hi = (((((((($imul(alo, b.hi$2) + $imul(this.hi$2, blo)) | 0) + $imul(a1, b1)) | 0) + ((c1part >>> 16) | 0)) | 0) + (((((65535 & c1part) + a1b0) | 0) >>> 16) | 0)) | 0);
    return new $c_sjsr_RuntimeLong().init___I__I(lo, hi)
  };
  init___I__I__I(l, m, h) {
    $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, (l | (m << 22)), ((m >> 10) | (h << 12)));
    return this
  };
  $$percent__sjsr_RuntimeLong__sjsr_RuntimeLong(b) {
    const this$1 = $m_sjsr_RuntimeLong$();
    const lo = this$1.remainderImpl__I__I__I__I__I(this.lo$2, this.hi$2, b.lo$2, b.hi$2);
    return new $c_sjsr_RuntimeLong().init___I__I(lo, this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
  };
  toString__T() {
    return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toString__I__I__T(this.lo$2, this.hi$2)
  };
  init___I__I(lo, hi) {
    this.lo$2 = lo;
    this.hi$2 = hi;
    return this
  };
  compareTo__O__I(x$1) {
    const that = x$1;
    return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(this.lo$2, this.hi$2, that.lo$2, that.hi$2)
  };
  $$less$eq__sjsr_RuntimeLong__Z(b) {
    const ahi = this.hi$2;
    const bhi = b.hi$2;
    return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) <= ((-2147483648) ^ b.lo$2)) : (ahi < bhi))
  };
  $$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(b) {
    return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 & b.lo$2), (this.hi$2 & b.hi$2))
  };
  $$greater$greater$greater__I__sjsr_RuntimeLong(n) {
    return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (((this.lo$2 >>> n) | 0) | ((this.hi$2 << 1) << ((31 - n) | 0))) : ((this.hi$2 >>> n) | 0)), (((32 & n) === 0) ? ((this.hi$2 >>> n) | 0) : 0))
  };
  $$greater__sjsr_RuntimeLong__Z(b) {
    const ahi = this.hi$2;
    const bhi = b.hi$2;
    return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) > ((-2147483648) ^ b.lo$2)) : (ahi > bhi))
  };
  $$less$less__I__sjsr_RuntimeLong(n) {
    return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (this.lo$2 << n) : 0), (((32 & n) === 0) ? (((((this.lo$2 >>> 1) | 0) >>> ((31 - n) | 0)) | 0) | (this.hi$2 << n)) : (this.lo$2 << n)))
  };
  init___I(value) {
    $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, value, (value >> 31));
    return this
  };
  toInt__I() {
    return this.lo$2
  };
  notEquals__sjsr_RuntimeLong__Z(b) {
    return (!((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2)))
  };
  unary$und$minus__sjsr_RuntimeLong() {
    const lo = this.lo$2;
    const hi = this.hi$2;
    return new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))
  };
  $$plus__sjsr_RuntimeLong__sjsr_RuntimeLong(b) {
    const alo = this.lo$2;
    const ahi = this.hi$2;
    const bhi = b.hi$2;
    const lo = ((alo + b.lo$2) | 0);
    return new $c_sjsr_RuntimeLong().init___I__I(lo, ((((-2147483648) ^ lo) < ((-2147483648) ^ alo)) ? ((1 + ((ahi + bhi) | 0)) | 0) : ((ahi + bhi) | 0)))
  };
  shortValue__S() {
    return ((this.lo$2 << 16) >> 16)
  };
  $$greater$greater__I__sjsr_RuntimeLong(n) {
    return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (((this.lo$2 >>> n) | 0) | ((this.hi$2 << 1) << ((31 - n) | 0))) : (this.hi$2 >> n)), (((32 & n) === 0) ? (this.hi$2 >> n) : (this.hi$2 >> 31)))
  };
  toDouble__D() {
    return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2)
  };
  $$div__sjsr_RuntimeLong__sjsr_RuntimeLong(b) {
    const this$1 = $m_sjsr_RuntimeLong$();
    const lo = this$1.divideImpl__I__I__I__I__I(this.lo$2, this.hi$2, b.lo$2, b.hi$2);
    return new $c_sjsr_RuntimeLong().init___I__I(lo, this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
  };
  doubleValue__D() {
    return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2)
  };
  hashCode__I() {
    return (this.lo$2 ^ this.hi$2)
  };
  intValue__I() {
    return this.lo$2
  };
  unary$und$tilde__sjsr_RuntimeLong() {
    return new $c_sjsr_RuntimeLong().init___I__I((~this.lo$2), (~this.hi$2))
  };
  compareTo__jl_Long__I(that) {
    return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(this.lo$2, this.hi$2, that.lo$2, that.hi$2)
  };
  floatValue__F() {
    return $fround($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2))
  };
  $$minus__sjsr_RuntimeLong__sjsr_RuntimeLong(b) {
    const alo = this.lo$2;
    const ahi = this.hi$2;
    const bhi = b.hi$2;
    const lo = ((alo - b.lo$2) | 0);
    return new $c_sjsr_RuntimeLong().init___I__I(lo, ((((-2147483648) ^ lo) > ((-2147483648) ^ alo)) ? (((-1) + ((ahi - bhi) | 0)) | 0) : ((ahi - bhi) | 0)))
  };
  $$up__sjsr_RuntimeLong__sjsr_RuntimeLong(b) {
    return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 ^ b.lo$2), (this.hi$2 ^ b.hi$2))
  };
  equals__sjsr_RuntimeLong__Z(b) {
    return ((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2))
  };
}
const $is_sjsr_RuntimeLong = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_RuntimeLong)))
});
const $isArrayOf_sjsr_RuntimeLong = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeLong)))
});
const $d_sjsr_RuntimeLong = new $TypeData().initClass({
  sjsr_RuntimeLong: 0
}, false, "scala.scalajs.runtime.RuntimeLong", {
  sjsr_RuntimeLong: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_sjsr_RuntimeLong.prototype.$classData = $d_sjsr_RuntimeLong;
class $c_Llaughedelic_atom_ide_scala_BusySignal extends $c_O {
  constructor() {
    super();
    this.service$1 = null;
    this.name$1 = null;
    this.tooltip$1 = null
  };
  update__T__Z__Z__V(text, init, reveal) {
    const x1 = this.tooltip$1;
    if ($is_s_Some(x1)) {
      const x2 = x1;
      const tip = x2.value$2;
      const this$2 = new $c_sci_StringOps().init___T(text);
      if ($f_sc_TraversableOnce__nonEmpty__Z(this$2)) {
        tip.setTitle(this.formatMessage__p1__T__T(text))
      } else {
        tip.dispose();
        this.tooltip$1 = $m_s_None$()
      }
    } else {
      const x = $m_s_None$();
      if ((x === x1)) {
        if (init) {
          this.tooltip$1 = new $c_s_Some().init___O(this.service$1.reportBusy(this.formatMessage__p1__T__T(text), {
            "revealTooltip": reveal
          }))
        }
      } else {
        throw new $c_s_MatchError().init___O(x1)
      }
    }
  };
  productPrefix__T() {
    return "BusySignal"
  };
  productArity__I() {
    return 2
  };
  formatMessage__p1__T__T(text) {
    return new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["", ": ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.name$1, text]))
  };
  productElement__I__O(x$1) {
    switch (x$1) {
      case 0: {
        return this.service$1;
        break
      }
      case 1: {
        return this.name$1;
        break
      }
      default: {
        throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
      }
    }
  };
  toString__T() {
    return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
  };
  init___Llaughedelic_atom_ide_scala_facade_atom$undide_busy$undsignal_BusySignalService__T(service, name) {
    this.service$1 = service;
    this.name$1 = name;
    this.tooltip$1 = $m_s_None$();
    return this
  };
  hashCode__I() {
    const this$2 = $m_s_util_hashing_MurmurHash3$();
    return this$2.productHash__s_Product__I__I(this, (-889275714))
  };
  productIterator__sc_Iterator() {
    return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
  };
}
const $is_Llaughedelic_atom_ide_scala_BusySignal = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Llaughedelic_atom_ide_scala_BusySignal)))
});
const $isArrayOf_Llaughedelic_atom_ide_scala_BusySignal = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Llaughedelic_atom_ide_scala_BusySignal)))
});
const $d_Llaughedelic_atom_ide_scala_BusySignal = new $TypeData().initClass({
  Llaughedelic_atom_ide_scala_BusySignal: 0
}, false, "laughedelic.atom.ide.scala.BusySignal", {
  Llaughedelic_atom_ide_scala_BusySignal: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Llaughedelic_atom_ide_scala_BusySignal.prototype.$classData = $d_Llaughedelic_atom_ide_scala_BusySignal;
class $c_jl_ArithmeticException extends $c_jl_RuntimeException {
  init___T(s) {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
    return this
  };
}
const $d_jl_ArithmeticException = new $TypeData().initClass({
  jl_ArithmeticException: 0
}, false, "java.lang.ArithmeticException", {
  jl_ArithmeticException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ArithmeticException.prototype.$classData = $d_jl_ArithmeticException;
class $c_jl_IllegalArgumentException extends $c_jl_RuntimeException {
  init___() {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
    return this
  };
  init___T(s) {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
    return this
  };
}
const $d_jl_IllegalArgumentException = new $TypeData().initClass({
  jl_IllegalArgumentException: 0
}, false, "java.lang.IllegalArgumentException", {
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalArgumentException.prototype.$classData = $d_jl_IllegalArgumentException;
class $c_jl_IndexOutOfBoundsException extends $c_jl_RuntimeException {
  init___T(s) {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
    return this
  };
}
const $d_jl_IndexOutOfBoundsException = new $TypeData().initClass({
  jl_IndexOutOfBoundsException: 0
}, false, "java.lang.IndexOutOfBoundsException", {
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IndexOutOfBoundsException.prototype.$classData = $d_jl_IndexOutOfBoundsException;
class $c_jl_NegativeArraySizeException extends $c_jl_RuntimeException {
  init___() {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
    return this
  };
}
const $d_jl_NegativeArraySizeException = new $TypeData().initClass({
  jl_NegativeArraySizeException: 0
}, false, "java.lang.NegativeArraySizeException", {
  jl_NegativeArraySizeException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NegativeArraySizeException.prototype.$classData = $d_jl_NegativeArraySizeException;
class $c_jl_NullPointerException extends $c_jl_RuntimeException {
  init___() {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
    return this
  };
}
const $d_jl_NullPointerException = new $TypeData().initClass({
  jl_NullPointerException: 0
}, false, "java.lang.NullPointerException", {
  jl_NullPointerException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NullPointerException.prototype.$classData = $d_jl_NullPointerException;
class $c_jl_UnsupportedOperationException extends $c_jl_RuntimeException {
  init___T(s) {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
    return this
  };
}
const $d_jl_UnsupportedOperationException = new $TypeData().initClass({
  jl_UnsupportedOperationException: 0
}, false, "java.lang.UnsupportedOperationException", {
  jl_UnsupportedOperationException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_UnsupportedOperationException.prototype.$classData = $d_jl_UnsupportedOperationException;
class $c_ju_NoSuchElementException extends $c_jl_RuntimeException {
  init___T(s) {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
    return this
  };
}
const $d_ju_NoSuchElementException = new $TypeData().initClass({
  ju_NoSuchElementException: 0
}, false, "java.util.NoSuchElementException", {
  ju_NoSuchElementException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_NoSuchElementException.prototype.$classData = $d_ju_NoSuchElementException;
class $c_s_MatchError extends $c_jl_RuntimeException {
  constructor() {
    super();
    this.objString$4 = null;
    this.obj$4 = null;
    this.bitmap$0$4 = false
  };
  objString$lzycompute__p4__T() {
    if ((!this.bitmap$0$4)) {
      this.objString$4 = ((this.obj$4 === null) ? "null" : this.liftedTree1$1__p4__T());
      this.bitmap$0$4 = true
    };
    return this.objString$4
  };
  ofClass$1__p4__T() {
    const this$1 = this.obj$4;
    return ("of class " + $objectGetClass(this$1).getName__T())
  };
  liftedTree1$1__p4__T() {
    try {
      return ((($objectToString(this.obj$4) + " (") + this.ofClass$1__p4__T()) + ")")
    } catch (e) {
      const e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        return ("an instance " + this.ofClass$1__p4__T())
      } else {
        throw e
      }
    }
  };
  getMessage__T() {
    return this.objString__p4__T()
  };
  objString__p4__T() {
    return ((!this.bitmap$0$4) ? this.objString$lzycompute__p4__T() : this.objString$4)
  };
  init___O(obj) {
    this.obj$4 = obj;
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
    return this
  };
}
const $d_s_MatchError = new $TypeData().initClass({
  s_MatchError: 0
}, false, "scala.MatchError", {
  s_MatchError: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_MatchError.prototype.$classData = $d_s_MatchError;
class $c_s_Option extends $c_O {
}
class $c_s_Predef$$anon$1 extends $c_s_Predef$$less$colon$less {
  init___() {
    return this
  };
  apply__O__O(x) {
    return x
  };
}
const $d_s_Predef$$anon$1 = new $TypeData().initClass({
  s_Predef$$anon$1: 0
}, false, "scala.Predef$$anon$1", {
  s_Predef$$anon$1: 1,
  s_Predef$$less$colon$less: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Predef$$anon$1.prototype.$classData = $d_s_Predef$$anon$1;
class $c_s_Predef$$anon$2 extends $c_s_Predef$$eq$colon$eq {
  init___() {
    return this
  };
  apply__O__O(x) {
    return x
  };
}
const $d_s_Predef$$anon$2 = new $TypeData().initClass({
  s_Predef$$anon$2: 0
}, false, "scala.Predef$$anon$2", {
  s_Predef$$anon$2: 1,
  s_Predef$$eq$colon$eq: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Predef$$anon$2.prototype.$classData = $d_s_Predef$$anon$2;
class $c_s_StringContext extends $c_O {
  constructor() {
    super();
    this.parts$1 = null
  };
  productPrefix__T() {
    return "StringContext"
  };
  productArity__I() {
    return 1
  };
  productElement__I__O(x$1) {
    switch (x$1) {
      case 0: {
        return this.parts$1;
        break
      }
      default: {
        throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
      }
    }
  };
  toString__T() {
    return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
  };
  checkLengths__sc_Seq__V(args) {
    if ((this.parts$1.length__I() !== ((1 + args.length__I()) | 0))) {
      throw new $c_jl_IllegalArgumentException().init___T((((("wrong number of arguments (" + args.length__I()) + ") for interpolated string with ") + this.parts$1.length__I()) + " parts"))
    }
  };
  s__sc_Seq__T(args) {
    const f = (function($this) {
      return (function(str$2) {
        const str = str$2;
        const this$1 = $m_s_StringContext$();
        return this$1.treatEscapes0__p1__T__Z__T(str, false)
      })
    })(this);
    this.checkLengths__sc_Seq__V(args);
    const pi = this.parts$1.iterator__sc_Iterator();
    const ai = args.iterator__sc_Iterator();
    const arg1 = pi.next__O();
    const bldr = new $c_jl_StringBuilder().init___T(f(arg1));
    while (ai.hasNext__Z()) {
      const obj = ai.next__O();
      bldr.java$lang$StringBuilder$$content$f = (("" + bldr.java$lang$StringBuilder$$content$f) + obj);
      const arg1$1 = pi.next__O();
      const str$1 = f(arg1$1);
      bldr.java$lang$StringBuilder$$content$f = (("" + bldr.java$lang$StringBuilder$$content$f) + str$1)
    };
    return bldr.java$lang$StringBuilder$$content$f
  };
  init___sc_Seq(parts) {
    this.parts$1 = parts;
    return this
  };
  hashCode__I() {
    const this$2 = $m_s_util_hashing_MurmurHash3$();
    return this$2.productHash__s_Product__I__I(this, (-889275714))
  };
  productIterator__sc_Iterator() {
    return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
  };
}
const $d_s_StringContext = new $TypeData().initClass({
  s_StringContext: 0
}, false, "scala.StringContext", {
  s_StringContext: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext.prototype.$classData = $d_s_StringContext;
class $c_s_util_control_BreakControl extends $c_jl_Throwable {
  init___() {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
    return this
  };
  fillInStackTrace__jl_Throwable() {
    return $f_s_util_control_NoStackTrace__fillInStackTrace__jl_Throwable(this)
  };
}
const $d_s_util_control_BreakControl = new $TypeData().initClass({
  s_util_control_BreakControl: 0
}, false, "scala.util.control.BreakControl", {
  s_util_control_BreakControl: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_s_util_control_BreakControl.prototype.$classData = $d_s_util_control_BreakControl;
class $c_sc_Iterable$ extends $c_scg_GenTraversableFactory {
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    return this
  };
}
const $d_sc_Iterable$ = new $TypeData().initClass({
  sc_Iterable$: 0
}, false, "scala.collection.Iterable$", {
  sc_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Iterable$.prototype.$classData = $d_sc_Iterable$;
let $n_sc_Iterable$ = (void 0);
const $m_sc_Iterable$ = (function() {
  if ((!$n_sc_Iterable$)) {
    $n_sc_Iterable$ = new $c_sc_Iterable$().init___()
  };
  return $n_sc_Iterable$
});
class $c_sc_Iterator$$anon$2 extends $c_sc_AbstractIterator {
  init___() {
    return this
  };
  next__O() {
    this.next__sr_Nothing$()
  };
  next__sr_Nothing$() {
    throw new $c_ju_NoSuchElementException().init___T("next on empty iterator")
  };
  hasNext__Z() {
    return false
  };
}
const $d_sc_Iterator$$anon$2 = new $TypeData().initClass({
  sc_Iterator$$anon$2: 0
}, false, "scala.collection.Iterator$$anon$2", {
  sc_Iterator$$anon$2: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_Iterator$$anon$2.prototype.$classData = $d_sc_Iterator$$anon$2;
class $c_sc_LinearSeqLike$$anon$1 extends $c_sc_AbstractIterator {
  constructor() {
    super();
    this.these$2 = null
  };
  init___sc_LinearSeqLike($$outer) {
    this.these$2 = $$outer;
    return this
  };
  next__O() {
    if (this.hasNext__Z()) {
      const this$1 = this.these$2;
      this$1.head__sr_Nothing$()
    } else {
      return $m_sc_Iterator$().empty$1.next__O()
    }
  };
  hasNext__Z() {
    return (!this.these$2.isEmpty__Z())
  };
}
const $d_sc_LinearSeqLike$$anon$1 = new $TypeData().initClass({
  sc_LinearSeqLike$$anon$1: 0
}, false, "scala.collection.LinearSeqLike$$anon$1", {
  sc_LinearSeqLike$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_LinearSeqLike$$anon$1.prototype.$classData = $d_sc_LinearSeqLike$$anon$1;
class $c_sc_Traversable$ extends $c_scg_GenTraversableFactory {
  constructor() {
    super();
    this.breaks$3 = null
  };
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    $n_sc_Traversable$ = this;
    this.breaks$3 = new $c_s_util_control_Breaks().init___();
    return this
  };
}
const $d_sc_Traversable$ = new $TypeData().initClass({
  sc_Traversable$: 0
}, false, "scala.collection.Traversable$", {
  sc_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Traversable$.prototype.$classData = $d_sc_Traversable$;
let $n_sc_Traversable$ = (void 0);
const $m_sc_Traversable$ = (function() {
  if ((!$n_sc_Traversable$)) {
    $n_sc_Traversable$ = new $c_sc_Traversable$().init___()
  };
  return $n_sc_Traversable$
});
class $c_scg_ImmutableSetFactory extends $c_scg_SetFactory {
}
class $c_sr_ScalaRunTime$$anon$1 extends $c_sc_AbstractIterator {
  constructor() {
    super();
    this.c$2 = 0;
    this.cmax$2 = 0;
    this.x$2$2 = null
  };
  next__O() {
    const result = this.x$2$2.productElement__I__O(this.c$2);
    this.c$2 = ((1 + this.c$2) | 0);
    return result
  };
  init___s_Product(x$2) {
    this.x$2$2 = x$2;
    this.c$2 = 0;
    this.cmax$2 = x$2.productArity__I();
    return this
  };
  hasNext__Z() {
    return (this.c$2 < this.cmax$2)
  };
}
const $d_sr_ScalaRunTime$$anon$1 = new $TypeData().initClass({
  sr_ScalaRunTime$$anon$1: 0
}, false, "scala.runtime.ScalaRunTime$$anon$1", {
  sr_ScalaRunTime$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sr_ScalaRunTime$$anon$1.prototype.$classData = $d_sr_ScalaRunTime$$anon$1;
class $c_s_None$ extends $c_s_Option {
  init___() {
    return this
  };
  productPrefix__T() {
    return "None"
  };
  productArity__I() {
    return 0
  };
  productElement__I__O(x$1) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
  };
  toString__T() {
    return "None"
  };
  hashCode__I() {
    return 2433880
  };
  productIterator__sc_Iterator() {
    return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
  };
}
const $d_s_None$ = new $TypeData().initClass({
  s_None$: 0
}, false, "scala.None$", {
  s_None$: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_None$.prototype.$classData = $d_s_None$;
let $n_s_None$ = (void 0);
const $m_s_None$ = (function() {
  if ((!$n_s_None$)) {
    $n_s_None$ = new $c_s_None$().init___()
  };
  return $n_s_None$
});
class $c_s_Some extends $c_s_Option {
  constructor() {
    super();
    this.value$2 = null
  };
  productPrefix__T() {
    return "Some"
  };
  productArity__I() {
    return 1
  };
  productElement__I__O(x$1) {
    switch (x$1) {
      case 0: {
        return this.value$2;
        break
      }
      default: {
        throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
      }
    }
  };
  toString__T() {
    return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
  };
  init___O(value) {
    this.value$2 = value;
    return this
  };
  hashCode__I() {
    const this$2 = $m_s_util_hashing_MurmurHash3$();
    return this$2.productHash__s_Product__I__I(this, (-889275714))
  };
  productIterator__sc_Iterator() {
    return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
  };
}
const $is_s_Some = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_Some)))
});
const $isArrayOf_s_Some = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Some)))
});
const $d_s_Some = new $TypeData().initClass({
  s_Some: 0
}, false, "scala.Some", {
  s_Some: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Some.prototype.$classData = $d_s_Some;
class $c_s_StringContext$InvalidEscapeException extends $c_jl_IllegalArgumentException {
  constructor() {
    super();
    this.index$5 = 0
  };
  init___T__I(str, index) {
    this.index$5 = index;
    const jsx$3 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["invalid escape ", " index ", " in \"", "\". Use \\\\\\\\ for literal \\\\."]));
    $m_s_Predef$().require__Z__V(((index >= 0) && (index < (str.length | 0))));
    let jsx$1;
    if ((index === (((-1) + (str.length | 0)) | 0))) {
      jsx$1 = "at terminal"
    } else {
      const jsx$2 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["'\\\\", "' not one of ", " at"]));
      const index$1 = ((1 + index) | 0);
      const c = (65535 & (str.charCodeAt(index$1) | 0));
      jsx$1 = jsx$2.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_jl_Character().init___C(c), "[\\b, \\t, \\n, \\f, \\r, \\\\, \\\", \\']"]))
    };
    const s = jsx$3.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$1, index, str]));
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
    return this
  };
}
const $d_s_StringContext$InvalidEscapeException = new $TypeData().initClass({
  s_StringContext$InvalidEscapeException: 0
}, false, "scala.StringContext$InvalidEscapeException", {
  s_StringContext$InvalidEscapeException: 1,
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext$InvalidEscapeException.prototype.$classData = $d_s_StringContext$InvalidEscapeException;
const $f_sc_TraversableLike__isPartLikelySynthetic$1__psc_TraversableLike__T__I__Z = (function($thiz, fqn$1, partStart$1) {
  const firstChar = (65535 & (fqn$1.charCodeAt(partStart$1) | 0));
  return (((firstChar > 90) && (firstChar < 127)) || (firstChar < 65))
});
const $f_sc_TraversableLike__toString__T = (function($thiz) {
  const start = ($thiz.stringPrefix__T() + "(");
  return $f_sc_TraversableOnce__mkString__T__T__T__T($thiz, start, ", ", ")")
});
const $f_sc_TraversableLike__stringPrefix__T = (function($thiz) {
  const this$1 = $thiz.repr__O();
  const fqn = $objectGetClass(this$1).getName__T();
  let pos = (((-1) + (fqn.length | 0)) | 0);
  while (true) {
    let jsx$1;
    if ((pos !== (-1))) {
      const index = pos;
      jsx$1 = ((65535 & (fqn.charCodeAt(index) | 0)) === 36)
    } else {
      jsx$1 = false
    };
    if (jsx$1) {
      pos = (((-1) + pos) | 0)
    } else {
      break
    }
  };
  let jsx$2;
  if ((pos === (-1))) {
    jsx$2 = true
  } else {
    const index$1 = pos;
    jsx$2 = ((65535 & (fqn.charCodeAt(index$1) | 0)) === 46)
  };
  if (jsx$2) {
    return ""
  };
  let result = "";
  while (true) {
    const partEnd = ((1 + pos) | 0);
    while (true) {
      let jsx$4;
      if ((pos !== (-1))) {
        const index$2 = pos;
        jsx$4 = ((65535 & (fqn.charCodeAt(index$2) | 0)) <= 57)
      } else {
        jsx$4 = false
      };
      let jsx$3;
      if (jsx$4) {
        const index$3 = pos;
        jsx$3 = ((65535 & (fqn.charCodeAt(index$3) | 0)) >= 48)
      } else {
        jsx$3 = false
      };
      if (jsx$3) {
        pos = (((-1) + pos) | 0)
      } else {
        break
      }
    };
    const lastNonDigit = pos;
    while (true) {
      let jsx$6;
      if ((pos !== (-1))) {
        const index$4 = pos;
        jsx$6 = ((65535 & (fqn.charCodeAt(index$4) | 0)) !== 36)
      } else {
        jsx$6 = false
      };
      let jsx$5;
      if (jsx$6) {
        const index$5 = pos;
        jsx$5 = ((65535 & (fqn.charCodeAt(index$5) | 0)) !== 46)
      } else {
        jsx$5 = false
      };
      if (jsx$5) {
        pos = (((-1) + pos) | 0)
      } else {
        break
      }
    };
    const partStart = ((1 + pos) | 0);
    if (((pos === lastNonDigit) && (partEnd !== (fqn.length | 0)))) {
      return result
    };
    while (true) {
      let jsx$7;
      if ((pos !== (-1))) {
        const index$6 = pos;
        jsx$7 = ((65535 & (fqn.charCodeAt(index$6) | 0)) === 36)
      } else {
        jsx$7 = false
      };
      if (jsx$7) {
        pos = (((-1) + pos) | 0)
      } else {
        break
      }
    };
    let atEnd;
    if ((pos === (-1))) {
      atEnd = true
    } else {
      const index$7 = pos;
      atEnd = ((65535 & (fqn.charCodeAt(index$7) | 0)) === 46)
    };
    if ((atEnd || (!$f_sc_TraversableLike__isPartLikelySynthetic$1__psc_TraversableLike__T__I__Z($thiz, fqn, partStart)))) {
      const part = fqn.substring(partStart, partEnd);
      const thiz = result;
      if ((thiz === null)) {
        throw new $c_jl_NullPointerException().init___()
      };
      if ((thiz === "")) {
        result = part
      } else {
        result = ((("" + part) + new $c_jl_Character().init___C(46)) + result)
      };
      if (atEnd) {
        return result
      }
    }
  }
});
class $c_scg_SeqFactory extends $c_scg_GenSeqFactory {
}
class $c_sci_Set$ extends $c_scg_ImmutableSetFactory {
  init___() {
    return this
  };
}
const $d_sci_Set$ = new $TypeData().initClass({
  sci_Set$: 0
}, false, "scala.collection.immutable.Set$", {
  sci_Set$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Set$.prototype.$classData = $d_sci_Set$;
let $n_sci_Set$ = (void 0);
const $m_sci_Set$ = (function() {
  if ((!$n_sci_Set$)) {
    $n_sci_Set$ = new $c_sci_Set$().init___()
  };
  return $n_sci_Set$
});
class $c_sci_VectorIterator extends $c_sc_AbstractIterator {
  constructor() {
    super();
    this.endIndex$2 = 0;
    this.blockIndex$2 = 0;
    this.lo$2 = 0;
    this.endLo$2 = 0;
    this.$$undhasNext$2 = false;
    this.depth$2 = 0;
    this.display0$2 = null;
    this.display1$2 = null;
    this.display2$2 = null;
    this.display3$2 = null;
    this.display4$2 = null;
    this.display5$2 = null
  };
  next__O() {
    if ((!this.$$undhasNext$2)) {
      throw new $c_ju_NoSuchElementException().init___T("reached iterator end")
    };
    const res = this.display0$2.u[this.lo$2];
    this.lo$2 = ((1 + this.lo$2) | 0);
    if ((this.lo$2 === this.endLo$2)) {
      if ((((this.blockIndex$2 + this.lo$2) | 0) < this.endIndex$2)) {
        const newBlockIndex = ((32 + this.blockIndex$2) | 0);
        const xor = (this.blockIndex$2 ^ newBlockIndex);
        $f_sci_VectorPointer__gotoNextBlockStart__I__I__V(this, newBlockIndex, xor);
        this.blockIndex$2 = newBlockIndex;
        const x = ((this.endIndex$2 - this.blockIndex$2) | 0);
        this.endLo$2 = ((x < 32) ? x : 32);
        this.lo$2 = 0
      } else {
        this.$$undhasNext$2 = false
      }
    };
    return res
  };
  display3__AO() {
    return this.display3$2
  };
  depth__I() {
    return this.depth$2
  };
  display5$und$eq__AO__V(x$1) {
    this.display5$2 = x$1
  };
  init___I__I(_startIndex, endIndex) {
    this.endIndex$2 = endIndex;
    this.blockIndex$2 = ((-32) & _startIndex);
    this.lo$2 = (31 & _startIndex);
    const x = ((endIndex - this.blockIndex$2) | 0);
    this.endLo$2 = ((x < 32) ? x : 32);
    this.$$undhasNext$2 = (((this.blockIndex$2 + this.lo$2) | 0) < endIndex);
    return this
  };
  display0__AO() {
    return this.display0$2
  };
  display2$und$eq__AO__V(x$1) {
    this.display2$2 = x$1
  };
  display4__AO() {
    return this.display4$2
  };
  display1$und$eq__AO__V(x$1) {
    this.display1$2 = x$1
  };
  hasNext__Z() {
    return this.$$undhasNext$2
  };
  display4$und$eq__AO__V(x$1) {
    this.display4$2 = x$1
  };
  display1__AO() {
    return this.display1$2
  };
  display5__AO() {
    return this.display5$2
  };
  depth$und$eq__I__V(x$1) {
    this.depth$2 = x$1
  };
  display2__AO() {
    return this.display2$2
  };
  display0$und$eq__AO__V(x$1) {
    this.display0$2 = x$1
  };
  display3$und$eq__AO__V(x$1) {
    this.display3$2 = x$1
  };
}
const $d_sci_VectorIterator = new $TypeData().initClass({
  sci_VectorIterator: 0
}, false, "scala.collection.immutable.VectorIterator", {
  sci_VectorIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sci_VectorPointer: 1
});
$c_sci_VectorIterator.prototype.$classData = $d_sci_VectorIterator;
class $c_sc_Seq$ extends $c_scg_SeqFactory {
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    return this
  };
}
const $d_sc_Seq$ = new $TypeData().initClass({
  sc_Seq$: 0
}, false, "scala.collection.Seq$", {
  sc_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Seq$.prototype.$classData = $d_sc_Seq$;
let $n_sc_Seq$ = (void 0);
const $m_sc_Seq$ = (function() {
  if ((!$n_sc_Seq$)) {
    $n_sc_Seq$ = new $c_sc_Seq$().init___()
  };
  return $n_sc_Seq$
});
class $c_scg_IndexedSeqFactory extends $c_scg_SeqFactory {
}
class $c_s_reflect_AnyValManifest extends $c_O {
  constructor() {
    super();
    this.toString$1 = null
  };
  toString__T() {
    return this.toString$1
  };
  hashCode__I() {
    return $systemIdentityHashCode(this)
  };
}
class $c_s_reflect_ManifestFactory$ClassTypeManifest extends $c_O {
  constructor() {
    super();
    this.prefix$1 = null;
    this.runtimeClass1$1 = null;
    this.typeArguments$1 = null
  };
}
class $c_sc_IndexedSeq$ extends $c_scg_IndexedSeqFactory {
  constructor() {
    super();
    this.ReusableCBF$6 = null
  };
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    $n_sc_IndexedSeq$ = this;
    this.ReusableCBF$6 = new $c_sc_IndexedSeq$$anon$1().init___();
    return this
  };
}
const $d_sc_IndexedSeq$ = new $TypeData().initClass({
  sc_IndexedSeq$: 0
}, false, "scala.collection.IndexedSeq$", {
  sc_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_IndexedSeq$.prototype.$classData = $d_sc_IndexedSeq$;
let $n_sc_IndexedSeq$ = (void 0);
const $m_sc_IndexedSeq$ = (function() {
  if ((!$n_sc_IndexedSeq$)) {
    $n_sc_IndexedSeq$ = new $c_sc_IndexedSeq$().init___()
  };
  return $n_sc_IndexedSeq$
});
class $c_sc_IndexedSeqLike$Elements extends $c_sc_AbstractIterator {
  constructor() {
    super();
    this.end$2 = 0;
    this.index$2 = 0;
    this.$$outer$2 = null
  };
  next__O() {
    if ((this.index$2 >= this.end$2)) {
      $m_sc_Iterator$().empty$1.next__O()
    };
    const x = this.$$outer$2.apply__I__O(this.index$2);
    this.index$2 = ((1 + this.index$2) | 0);
    return x
  };
  init___sc_IndexedSeqLike__I__I($$outer, start, end) {
    this.end$2 = end;
    if (($$outer === null)) {
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
    } else {
      this.$$outer$2 = $$outer
    };
    this.index$2 = start;
    return this
  };
  hasNext__Z() {
    return (this.index$2 < this.end$2)
  };
}
const $d_sc_IndexedSeqLike$Elements = new $TypeData().initClass({
  sc_IndexedSeqLike$Elements: 0
}, false, "scala.collection.IndexedSeqLike$Elements", {
  sc_IndexedSeqLike$Elements: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_BufferedIterator: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sc_IndexedSeqLike$Elements.prototype.$classData = $d_sc_IndexedSeqLike$Elements;
class $c_sjs_js_JavaScriptException extends $c_jl_RuntimeException {
  constructor() {
    super();
    this.exception$4 = null
  };
  productPrefix__T() {
    return "JavaScriptException"
  };
  productArity__I() {
    return 1
  };
  fillInStackTrace__jl_Throwable() {
    const e = this.exception$4;
    this.stackdata = e;
    return this
  };
  productElement__I__O(x$1) {
    switch (x$1) {
      case 0: {
        return this.exception$4;
        break
      }
      default: {
        throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
      }
    }
  };
  getMessage__T() {
    return $objectToString(this.exception$4)
  };
  init___O(exception) {
    this.exception$4 = exception;
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
    return this
  };
  hashCode__I() {
    const this$2 = $m_s_util_hashing_MurmurHash3$();
    return this$2.productHash__s_Product__I__I(this, (-889275714))
  };
  productIterator__sc_Iterator() {
    return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
  };
}
const $is_sjs_js_JavaScriptException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_JavaScriptException)))
});
const $isArrayOf_sjs_js_JavaScriptException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_JavaScriptException)))
});
const $d_sjs_js_JavaScriptException = new $TypeData().initClass({
  sjs_js_JavaScriptException: 0
}, false, "scala.scalajs.js.JavaScriptException", {
  sjs_js_JavaScriptException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1
});
$c_sjs_js_JavaScriptException.prototype.$classData = $d_sjs_js_JavaScriptException;
class $c_s_reflect_ManifestFactory$BooleanManifest$ extends $c_s_reflect_AnyValManifest {
  init___() {
    this.toString$1 = "Boolean";
    return this
  };
}
const $d_s_reflect_ManifestFactory$BooleanManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$BooleanManifest$: 0
}, false, "scala.reflect.ManifestFactory$BooleanManifest$", {
  s_reflect_ManifestFactory$BooleanManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$BooleanManifest$;
let $n_s_reflect_ManifestFactory$BooleanManifest$ = (void 0);
const $m_s_reflect_ManifestFactory$BooleanManifest$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$BooleanManifest$)) {
    $n_s_reflect_ManifestFactory$BooleanManifest$ = new $c_s_reflect_ManifestFactory$BooleanManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$BooleanManifest$
});
class $c_s_reflect_ManifestFactory$ByteManifest$ extends $c_s_reflect_AnyValManifest {
  init___() {
    this.toString$1 = "Byte";
    return this
  };
}
const $d_s_reflect_ManifestFactory$ByteManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ByteManifest$: 0
}, false, "scala.reflect.ManifestFactory$ByteManifest$", {
  s_reflect_ManifestFactory$ByteManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ByteManifest$;
let $n_s_reflect_ManifestFactory$ByteManifest$ = (void 0);
const $m_s_reflect_ManifestFactory$ByteManifest$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$ByteManifest$)) {
    $n_s_reflect_ManifestFactory$ByteManifest$ = new $c_s_reflect_ManifestFactory$ByteManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ByteManifest$
});
class $c_s_reflect_ManifestFactory$CharManifest$ extends $c_s_reflect_AnyValManifest {
  init___() {
    this.toString$1 = "Char";
    return this
  };
}
const $d_s_reflect_ManifestFactory$CharManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$CharManifest$: 0
}, false, "scala.reflect.ManifestFactory$CharManifest$", {
  s_reflect_ManifestFactory$CharManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$CharManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$CharManifest$;
let $n_s_reflect_ManifestFactory$CharManifest$ = (void 0);
const $m_s_reflect_ManifestFactory$CharManifest$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$CharManifest$)) {
    $n_s_reflect_ManifestFactory$CharManifest$ = new $c_s_reflect_ManifestFactory$CharManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$CharManifest$
});
class $c_s_reflect_ManifestFactory$DoubleManifest$ extends $c_s_reflect_AnyValManifest {
  init___() {
    this.toString$1 = "Double";
    return this
  };
}
const $d_s_reflect_ManifestFactory$DoubleManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$DoubleManifest$: 0
}, false, "scala.reflect.ManifestFactory$DoubleManifest$", {
  s_reflect_ManifestFactory$DoubleManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$DoubleManifest$;
let $n_s_reflect_ManifestFactory$DoubleManifest$ = (void 0);
const $m_s_reflect_ManifestFactory$DoubleManifest$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$DoubleManifest$)) {
    $n_s_reflect_ManifestFactory$DoubleManifest$ = new $c_s_reflect_ManifestFactory$DoubleManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$DoubleManifest$
});
class $c_s_reflect_ManifestFactory$FloatManifest$ extends $c_s_reflect_AnyValManifest {
  init___() {
    this.toString$1 = "Float";
    return this
  };
}
const $d_s_reflect_ManifestFactory$FloatManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$FloatManifest$: 0
}, false, "scala.reflect.ManifestFactory$FloatManifest$", {
  s_reflect_ManifestFactory$FloatManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$FloatManifest$;
let $n_s_reflect_ManifestFactory$FloatManifest$ = (void 0);
const $m_s_reflect_ManifestFactory$FloatManifest$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$FloatManifest$)) {
    $n_s_reflect_ManifestFactory$FloatManifest$ = new $c_s_reflect_ManifestFactory$FloatManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$FloatManifest$
});
class $c_s_reflect_ManifestFactory$IntManifest$ extends $c_s_reflect_AnyValManifest {
  init___() {
    this.toString$1 = "Int";
    return this
  };
}
const $d_s_reflect_ManifestFactory$IntManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$IntManifest$: 0
}, false, "scala.reflect.ManifestFactory$IntManifest$", {
  s_reflect_ManifestFactory$IntManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$IntManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$IntManifest$;
let $n_s_reflect_ManifestFactory$IntManifest$ = (void 0);
const $m_s_reflect_ManifestFactory$IntManifest$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$IntManifest$)) {
    $n_s_reflect_ManifestFactory$IntManifest$ = new $c_s_reflect_ManifestFactory$IntManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$IntManifest$
});
class $c_s_reflect_ManifestFactory$LongManifest$ extends $c_s_reflect_AnyValManifest {
  init___() {
    this.toString$1 = "Long";
    return this
  };
}
const $d_s_reflect_ManifestFactory$LongManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$LongManifest$: 0
}, false, "scala.reflect.ManifestFactory$LongManifest$", {
  s_reflect_ManifestFactory$LongManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$LongManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$LongManifest$;
let $n_s_reflect_ManifestFactory$LongManifest$ = (void 0);
const $m_s_reflect_ManifestFactory$LongManifest$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$LongManifest$)) {
    $n_s_reflect_ManifestFactory$LongManifest$ = new $c_s_reflect_ManifestFactory$LongManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$LongManifest$
});
class $c_s_reflect_ManifestFactory$PhantomManifest extends $c_s_reflect_ManifestFactory$ClassTypeManifest {
  constructor() {
    super();
    this.toString$2 = null
  };
  toString__T() {
    return this.toString$2
  };
  hashCode__I() {
    return $systemIdentityHashCode(this)
  };
}
class $c_s_reflect_ManifestFactory$ShortManifest$ extends $c_s_reflect_AnyValManifest {
  init___() {
    this.toString$1 = "Short";
    return this
  };
}
const $d_s_reflect_ManifestFactory$ShortManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ShortManifest$: 0
}, false, "scala.reflect.ManifestFactory$ShortManifest$", {
  s_reflect_ManifestFactory$ShortManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ShortManifest$;
let $n_s_reflect_ManifestFactory$ShortManifest$ = (void 0);
const $m_s_reflect_ManifestFactory$ShortManifest$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$ShortManifest$)) {
    $n_s_reflect_ManifestFactory$ShortManifest$ = new $c_s_reflect_ManifestFactory$ShortManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ShortManifest$
});
class $c_s_reflect_ManifestFactory$UnitManifest$ extends $c_s_reflect_AnyValManifest {
  init___() {
    this.toString$1 = "Unit";
    return this
  };
}
const $d_s_reflect_ManifestFactory$UnitManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$UnitManifest$: 0
}, false, "scala.reflect.ManifestFactory$UnitManifest$", {
  s_reflect_ManifestFactory$UnitManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$UnitManifest$;
let $n_s_reflect_ManifestFactory$UnitManifest$ = (void 0);
const $m_s_reflect_ManifestFactory$UnitManifest$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$UnitManifest$)) {
    $n_s_reflect_ManifestFactory$UnitManifest$ = new $c_s_reflect_ManifestFactory$UnitManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$UnitManifest$
});
class $c_sci_List$ extends $c_scg_SeqFactory {
  constructor() {
    super();
    this.partialNotApplied$5 = null
  };
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    $n_sci_List$ = this;
    this.partialNotApplied$5 = new $c_sci_List$$anon$1().init___();
    return this
  };
}
const $d_sci_List$ = new $TypeData().initClass({
  sci_List$: 0
}, false, "scala.collection.immutable.List$", {
  sci_List$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_List$.prototype.$classData = $d_sci_List$;
let $n_sci_List$ = (void 0);
const $m_sci_List$ = (function() {
  if ((!$n_sci_List$)) {
    $n_sci_List$ = new $c_sci_List$().init___()
  };
  return $n_sci_List$
});
class $c_sci_Stream$ extends $c_scg_SeqFactory {
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    return this
  };
}
const $d_sci_Stream$ = new $TypeData().initClass({
  sci_Stream$: 0
}, false, "scala.collection.immutable.Stream$", {
  sci_Stream$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$.prototype.$classData = $d_sci_Stream$;
let $n_sci_Stream$ = (void 0);
const $m_sci_Stream$ = (function() {
  if ((!$n_sci_Stream$)) {
    $n_sci_Stream$ = new $c_sci_Stream$().init___()
  };
  return $n_sci_Stream$
});
class $c_s_reflect_ManifestFactory$AnyManifest$ extends $c_s_reflect_ManifestFactory$PhantomManifest {
  init___() {
    this.toString$2 = "Any";
    const prefix = $m_s_None$();
    const typeArguments = $m_sci_Nil$();
    this.prefix$1 = prefix;
    this.runtimeClass1$1 = $d_O.getClassOf();
    this.typeArguments$1 = typeArguments;
    return this
  };
}
const $d_s_reflect_ManifestFactory$AnyManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$AnyManifest$: 0
}, false, "scala.reflect.ManifestFactory$AnyManifest$", {
  s_reflect_ManifestFactory$AnyManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$AnyManifest$;
let $n_s_reflect_ManifestFactory$AnyManifest$ = (void 0);
const $m_s_reflect_ManifestFactory$AnyManifest$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$AnyManifest$)) {
    $n_s_reflect_ManifestFactory$AnyManifest$ = new $c_s_reflect_ManifestFactory$AnyManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$AnyManifest$
});
class $c_s_reflect_ManifestFactory$AnyValManifest$ extends $c_s_reflect_ManifestFactory$PhantomManifest {
  init___() {
    this.toString$2 = "AnyVal";
    const prefix = $m_s_None$();
    const typeArguments = $m_sci_Nil$();
    this.prefix$1 = prefix;
    this.runtimeClass1$1 = $d_O.getClassOf();
    this.typeArguments$1 = typeArguments;
    return this
  };
}
const $d_s_reflect_ManifestFactory$AnyValManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$AnyValManifest$: 0
}, false, "scala.reflect.ManifestFactory$AnyValManifest$", {
  s_reflect_ManifestFactory$AnyValManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$AnyValManifest$;
let $n_s_reflect_ManifestFactory$AnyValManifest$ = (void 0);
const $m_s_reflect_ManifestFactory$AnyValManifest$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$AnyValManifest$)) {
    $n_s_reflect_ManifestFactory$AnyValManifest$ = new $c_s_reflect_ManifestFactory$AnyValManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$AnyValManifest$
});
class $c_s_reflect_ManifestFactory$NothingManifest$ extends $c_s_reflect_ManifestFactory$PhantomManifest {
  init___() {
    this.toString$2 = "Nothing";
    const prefix = $m_s_None$();
    const typeArguments = $m_sci_Nil$();
    this.prefix$1 = prefix;
    this.runtimeClass1$1 = $d_sr_Nothing$.getClassOf();
    this.typeArguments$1 = typeArguments;
    return this
  };
}
const $d_s_reflect_ManifestFactory$NothingManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$NothingManifest$: 0
}, false, "scala.reflect.ManifestFactory$NothingManifest$", {
  s_reflect_ManifestFactory$NothingManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$NothingManifest$;
let $n_s_reflect_ManifestFactory$NothingManifest$ = (void 0);
const $m_s_reflect_ManifestFactory$NothingManifest$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$NothingManifest$)) {
    $n_s_reflect_ManifestFactory$NothingManifest$ = new $c_s_reflect_ManifestFactory$NothingManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$NothingManifest$
});
class $c_s_reflect_ManifestFactory$NullManifest$ extends $c_s_reflect_ManifestFactory$PhantomManifest {
  init___() {
    this.toString$2 = "Null";
    const prefix = $m_s_None$();
    const typeArguments = $m_sci_Nil$();
    this.prefix$1 = prefix;
    this.runtimeClass1$1 = $d_sr_Null$.getClassOf();
    this.typeArguments$1 = typeArguments;
    return this
  };
}
const $d_s_reflect_ManifestFactory$NullManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$NullManifest$: 0
}, false, "scala.reflect.ManifestFactory$NullManifest$", {
  s_reflect_ManifestFactory$NullManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$NullManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$NullManifest$;
let $n_s_reflect_ManifestFactory$NullManifest$ = (void 0);
const $m_s_reflect_ManifestFactory$NullManifest$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$NullManifest$)) {
    $n_s_reflect_ManifestFactory$NullManifest$ = new $c_s_reflect_ManifestFactory$NullManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$NullManifest$
});
class $c_s_reflect_ManifestFactory$ObjectManifest$ extends $c_s_reflect_ManifestFactory$PhantomManifest {
  init___() {
    this.toString$2 = "Object";
    const prefix = $m_s_None$();
    const typeArguments = $m_sci_Nil$();
    this.prefix$1 = prefix;
    this.runtimeClass1$1 = $d_O.getClassOf();
    this.typeArguments$1 = typeArguments;
    return this
  };
}
const $d_s_reflect_ManifestFactory$ObjectManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ObjectManifest$: 0
}, false, "scala.reflect.ManifestFactory$ObjectManifest$", {
  s_reflect_ManifestFactory$ObjectManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ObjectManifest$;
let $n_s_reflect_ManifestFactory$ObjectManifest$ = (void 0);
const $m_s_reflect_ManifestFactory$ObjectManifest$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$ObjectManifest$)) {
    $n_s_reflect_ManifestFactory$ObjectManifest$ = new $c_s_reflect_ManifestFactory$ObjectManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ObjectManifest$
});
class $c_sci_Vector$ extends $c_scg_IndexedSeqFactory {
  constructor() {
    super();
    this.NIL$6 = null
  };
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    $n_sci_Vector$ = this;
    this.NIL$6 = new $c_sci_Vector().init___I__I__I(0, 0, 0);
    return this
  };
}
const $d_sci_Vector$ = new $TypeData().initClass({
  sci_Vector$: 0
}, false, "scala.collection.immutable.Vector$", {
  sci_Vector$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector$.prototype.$classData = $d_sci_Vector$;
let $n_sci_Vector$ = (void 0);
const $m_sci_Vector$ = (function() {
  if ((!$n_sci_Vector$)) {
    $n_sci_Vector$ = new $c_sci_Vector$().init___()
  };
  return $n_sci_Vector$
});
class $c_sc_AbstractTraversable extends $c_O {
  repr__O() {
    return this
  };
  stringPrefix__T() {
    return $f_sc_TraversableLike__stringPrefix__T(this)
  };
}
const $f_sc_SeqLike__isEmpty__Z = (function($thiz) {
  return ($thiz.lengthCompare__I__I(0) === 0)
});
const $f_sc_IndexedSeqOptimized__lengthCompare__I__I = (function($thiz, len) {
  return (($thiz.length__I() - len) | 0)
});
const $f_sc_IndexedSeqOptimized__isEmpty__Z = (function($thiz) {
  return ($thiz.length__I() === 0)
});
const $f_sc_IndexedSeqOptimized__foreach__F1__V = (function($thiz, f) {
  let i = 0;
  const len = $thiz.length__I();
  while ((i < len)) {
    f.apply__O__O($thiz.apply__I__O(i));
    i = ((1 + i) | 0)
  }
});
const $f_sc_LinearSeqOptimized__lengthCompare__I__I = (function($thiz, len) {
  if ((len < 0)) {
    return 1
  } else {
    let i = 0;
    let xs = $thiz;
    return $f_sc_LinearSeqOptimized__loop$1__psc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I($thiz, i, xs, len)
  }
});
const $f_sc_LinearSeqOptimized__apply__I__O = (function($thiz, n) {
  const rest = $thiz.drop__I__sci_List(n);
  if (((n < 0) || rest.isEmpty__Z())) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  };
  rest.head__sr_Nothing$()
});
const $f_sc_LinearSeqOptimized__length__I = (function($thiz) {
  let these = $thiz;
  let len = 0;
  while ((!these.isEmpty__Z())) {
    len = ((1 + len) | 0);
    const this$1 = these;
    these = this$1.tail__sci_List()
  };
  return len
});
const $f_sc_LinearSeqOptimized__loop$1__psc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I = (function($thiz, i, xs, len$1) {
  _loop: while (true) {
    if ((i === len$1)) {
      return (xs.isEmpty__Z() ? 0 : 1)
    } else if (xs.isEmpty__Z()) {
      return (-1)
    } else {
      const temp$i = ((1 + i) | 0);
      const this$1 = xs;
      const temp$xs = this$1.tail__sci_List();
      i = temp$i;
      xs = temp$xs;
      continue _loop
    }
  }
});
class $c_sc_AbstractIterable extends $c_sc_AbstractTraversable {
  foreach__F1__V(f) {
    const this$1 = this.iterator__sc_Iterator();
    $f_sc_Iterator__foreach__F1__V(this$1, f)
  };
}
class $c_sci_StringOps extends $c_O {
  constructor() {
    super();
    this.repr$1 = null
  };
  apply__I__O(idx) {
    const $$this = this.repr$1;
    const c = (65535 & ($$this.charCodeAt(idx) | 0));
    return new $c_jl_Character().init___C(c)
  };
  lengthCompare__I__I(len) {
    return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
  };
  isEmpty__Z() {
    return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
  };
  toString__T() {
    const $$this = this.repr$1;
    return $$this
  };
  foreach__F1__V(f) {
    $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
  };
  length__I() {
    const $$this = this.repr$1;
    return ($$this.length | 0)
  };
  repr__O() {
    return this.repr$1
  };
  init___T(repr) {
    this.repr$1 = repr;
    return this
  };
  hashCode__I() {
    const $$this = this.repr$1;
    return $m_sjsr_RuntimeString$().hashCode__T__I($$this)
  };
  stringPrefix__T() {
    return $f_sc_TraversableLike__stringPrefix__T(this)
  };
}
const $d_sci_StringOps = new $TypeData().initClass({
  sci_StringOps: 0
}, false, "scala.collection.immutable.StringOps", {
  sci_StringOps: 1,
  O: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1
});
$c_sci_StringOps.prototype.$classData = $d_sci_StringOps;
class $c_sc_AbstractSeq extends $c_sc_AbstractIterable {
  isEmpty__Z() {
    return $f_sc_SeqLike__isEmpty__Z(this)
  };
  toString__T() {
    return $f_sc_TraversableLike__toString__T(this)
  };
}
class $c_scm_AbstractSeq extends $c_sc_AbstractSeq {
}
class $c_sci_List extends $c_sc_AbstractSeq {
  lengthCompare__I__I(len) {
    return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this, len)
  };
  apply__O__O(v1) {
    const n = (v1 | 0);
    return $f_sc_LinearSeqOptimized__apply__I__O(this, n)
  };
  foreach__F1__V(f) {
    let these = this;
    while ((!these.isEmpty__Z())) {
      const this$1 = these;
      f.apply__O__O(this$1.head__sr_Nothing$());
      const this$2 = these;
      these = this$2.tail__sci_List()
    }
  };
  iterator__sc_Iterator() {
    return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this)
  };
  drop__I__sci_List(n) {
    let these = this;
    let count = n;
    while (((!these.isEmpty__Z()) && (count > 0))) {
      const this$1 = these;
      these = this$1.tail__sci_List();
      count = (((-1) + count) | 0)
    };
    return these
  };
  length__I() {
    return $f_sc_LinearSeqOptimized__length__I(this)
  };
  hashCode__I() {
    return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
  };
  stringPrefix__T() {
    return "List"
  };
}
const $is_sci_List = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_List)))
});
const $isArrayOf_sci_List = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_List)))
});
class $c_sci_Vector extends $c_sc_AbstractSeq {
  constructor() {
    super();
    this.startIndex$4 = 0;
    this.endIndex$4 = 0;
    this.focus$4 = 0;
    this.dirty$4 = false;
    this.depth$4 = 0;
    this.display0$4 = null;
    this.display1$4 = null;
    this.display2$4 = null;
    this.display3$4 = null;
    this.display4$4 = null;
    this.display5$4 = null
  };
  checkRangeConvert__p4__I__I(index) {
    const idx = ((index + this.startIndex$4) | 0);
    if (((index >= 0) && (idx < this.endIndex$4))) {
      return idx
    } else {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + index))
    }
  };
  display3__AO() {
    return this.display3$4
  };
  apply__I__O(index) {
    const idx = this.checkRangeConvert__p4__I__I(index);
    const xor = (idx ^ this.focus$4);
    return $f_sci_VectorPointer__getElem__I__I__O(this, idx, xor)
  };
  depth__I() {
    return this.depth$4
  };
  lengthCompare__I__I(len) {
    return ((this.length__I() - len) | 0)
  };
  apply__O__O(v1) {
    return this.apply__I__O((v1 | 0))
  };
  initIterator__sci_VectorIterator__V(s) {
    const depth = this.depth$4;
    $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s, this, depth);
    if (this.dirty$4) {
      const index = this.focus$4;
      $f_sci_VectorPointer__stabilize__I__V(s, index)
    };
    if ((s.depth$2 > 1)) {
      const index$1 = this.startIndex$4;
      const xor = (this.startIndex$4 ^ this.focus$4);
      $f_sci_VectorPointer__gotoPos__I__I__V(s, index$1, xor)
    }
  };
  init___I__I__I(startIndex, endIndex, focus) {
    this.startIndex$4 = startIndex;
    this.endIndex$4 = endIndex;
    this.focus$4 = focus;
    this.dirty$4 = false;
    return this
  };
  display5$und$eq__AO__V(x$1) {
    this.display5$4 = x$1
  };
  display0__AO() {
    return this.display0$4
  };
  display2$und$eq__AO__V(x$1) {
    this.display2$4 = x$1
  };
  display4__AO() {
    return this.display4$4
  };
  iterator__sc_Iterator() {
    return this.iterator__sci_VectorIterator()
  };
  display1$und$eq__AO__V(x$1) {
    this.display1$4 = x$1
  };
  display4$und$eq__AO__V(x$1) {
    this.display4$4 = x$1
  };
  length__I() {
    return ((this.endIndex$4 - this.startIndex$4) | 0)
  };
  display1__AO() {
    return this.display1$4
  };
  display5__AO() {
    return this.display5$4
  };
  iterator__sci_VectorIterator() {
    const s = new $c_sci_VectorIterator().init___I__I(this.startIndex$4, this.endIndex$4);
    this.initIterator__sci_VectorIterator__V(s);
    return s
  };
  hashCode__I() {
    return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
  };
  depth$und$eq__I__V(x$1) {
    this.depth$4 = x$1
  };
  display2__AO() {
    return this.display2$4
  };
  display0$und$eq__AO__V(x$1) {
    this.display0$4 = x$1
  };
  display3$und$eq__AO__V(x$1) {
    this.display3$4 = x$1
  };
}
const $d_sci_Vector = new $TypeData().initClass({
  sci_Vector: 0
}, false, "scala.collection.immutable.Vector", {
  sci_Vector: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sci_VectorPointer: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_Vector.prototype.$classData = $d_sci_Vector;
class $c_sci_Nil$ extends $c_sci_List {
  productPrefix__T() {
    return "Nil"
  };
  init___() {
    return this
  };
  productArity__I() {
    return 0
  };
  isEmpty__Z() {
    return true
  };
  tail__sci_List() {
    throw new $c_jl_UnsupportedOperationException().init___T("tail of empty list")
  };
  productElement__I__O(x$1) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
  };
  head__sr_Nothing$() {
    throw new $c_ju_NoSuchElementException().init___T("head of empty list")
  };
  productIterator__sc_Iterator() {
    return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
  };
}
const $d_sci_Nil$ = new $TypeData().initClass({
  sci_Nil$: 0
}, false, "scala.collection.immutable.Nil$", {
  sci_Nil$: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Nil$.prototype.$classData = $d_sci_Nil$;
let $n_sci_Nil$ = (void 0);
const $m_sci_Nil$ = (function() {
  if ((!$n_sci_Nil$)) {
    $n_sci_Nil$ = new $c_sci_Nil$().init___()
  };
  return $n_sci_Nil$
});
class $c_scm_AbstractBuffer extends $c_scm_AbstractSeq {
}
class $c_scm_StringBuilder extends $c_scm_AbstractSeq {
  constructor() {
    super();
    this.underlying$5 = null
  };
  init___() {
    $c_scm_StringBuilder.prototype.init___I__T.call(this, 16, "");
    return this
  };
  apply__I__O(idx) {
    const c = this.underlying$5.charAt__I__C(idx);
    return new $c_jl_Character().init___C(c)
  };
  lengthCompare__I__I(len) {
    return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
  };
  apply__O__O(v1) {
    const index = (v1 | 0);
    const c = this.underlying$5.charAt__I__C(index);
    return new $c_jl_Character().init___C(c)
  };
  isEmpty__Z() {
    return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
  };
  subSequence__I__I__jl_CharSequence(start, end) {
    return this.underlying$5.substring__I__I__T(start, end)
  };
  toString__T() {
    return this.underlying$5.java$lang$StringBuilder$$content$f
  };
  foreach__F1__V(f) {
    $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
  };
  iterator__sc_Iterator() {
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.underlying$5.length__I())
  };
  append__T__scm_StringBuilder(s) {
    const this$1 = this.underlying$5;
    this$1.java$lang$StringBuilder$$content$f = (("" + this$1.java$lang$StringBuilder$$content$f) + s);
    return this
  };
  init___I__T(initCapacity, initValue) {
    const this$2 = new $c_jl_StringBuilder().init___I((((initValue.length | 0) + initCapacity) | 0));
    this$2.java$lang$StringBuilder$$content$f = (("" + this$2.java$lang$StringBuilder$$content$f) + initValue);
    $c_scm_StringBuilder.prototype.init___jl_StringBuilder.call(this, this$2);
    return this
  };
  length__I() {
    return this.underlying$5.length__I()
  };
  init___jl_StringBuilder(underlying) {
    this.underlying$5 = underlying;
    return this
  };
  append__O__scm_StringBuilder(x) {
    const this$2 = this.underlying$5;
    const str = ("" + x);
    this$2.java$lang$StringBuilder$$content$f = (this$2.java$lang$StringBuilder$$content$f + str);
    return this
  };
  hashCode__I() {
    return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
  };
}
const $d_scm_StringBuilder = new $TypeData().initClass({
  scm_StringBuilder: 0
}, false, "scala.collection.mutable.StringBuilder", {
  scm_StringBuilder: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  jl_CharSequence: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder.prototype.$classData = $d_scm_StringBuilder;
class $c_sjs_js_WrappedArray extends $c_scm_AbstractBuffer {
  constructor() {
    super();
    this.array$6 = null
  };
  lengthCompare__I__I(len) {
    return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
  };
  apply__I__O(index) {
    return this.array$6[index]
  };
  apply__O__O(v1) {
    const index = (v1 | 0);
    return this.array$6[index]
  };
  isEmpty__Z() {
    return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
  };
  foreach__F1__V(f) {
    $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
  };
  iterator__sc_Iterator() {
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, (this.array$6.length | 0))
  };
  length__I() {
    return (this.array$6.length | 0)
  };
  hashCode__I() {
    return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
  };
  init___sjs_js_Array(array) {
    this.array$6 = array;
    return this
  };
  stringPrefix__T() {
    return "WrappedArray"
  };
}
const $d_sjs_js_WrappedArray = new $TypeData().initClass({
  sjs_js_WrappedArray: 0
}, false, "scala.scalajs.js.WrappedArray", {
  sjs_js_WrappedArray: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1
});
$c_sjs_js_WrappedArray.prototype.$classData = $d_sjs_js_WrappedArray;
$e.deactivate = (function() {
  return $m_Llaughedelic_atom_ide_scala_Exports$().deactivate__sjs_js_Promise()
});
$e.provideCodeFormat = (function() {
  return $m_Llaughedelic_atom_ide_scala_Exports$().provideCodeFormat__sjs_js_Any()
});
$e.provideDefinitions = (function() {
  return $m_Llaughedelic_atom_ide_scala_Exports$().provideDefinitions__sjs_js_Any()
});
$e.provideOutlines = (function() {
  return $m_Llaughedelic_atom_ide_scala_Exports$().provideOutlines__sjs_js_Any()
});
$e.consumeLinterV2 = (function(arg$1) {
  const prep0 = arg$1;
  $m_Llaughedelic_atom_ide_scala_Exports$().consumeLinterV2__sjs_js_Any__V(prep0)
});
$e.consumeDatatip = (function(arg$1) {
  const prep0 = arg$1;
  $m_Llaughedelic_atom_ide_scala_Exports$().consumeDatatip__sjs_js_Any__V(prep0)
});
$e.activate = (function() {
  $m_Llaughedelic_atom_ide_scala_Exports$().activate__V()
});
$e.consumeBusySignal = (function(arg$1) {
  const prep0 = arg$1;
  $m_Llaughedelic_atom_ide_scala_Exports$().consumeBusySignal__Llaughedelic_atom_ide_scala_facade_atom$undide_busy$undsignal_BusySignalService__V(prep0)
});
$e.provideAutocomplete = (function() {
  return $m_Llaughedelic_atom_ide_scala_Exports$().provideAutocomplete__sjs_js_Any()
});
//# sourceMappingURL=main.js.map

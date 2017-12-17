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












const $i_find$002djava$002dhome = require("find-java-home");
const $i_atom$002dlanguageclient = require("atom-languageclient");
const $i_path = require("path");
const $i_child$005fprocess = require("child_process");
const $i_fs = require("fs");
const $is_Llaughedelic_atom_ide_scala_ServerType = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Llaughedelic_atom_ide_scala_ServerType)))
});
const $isArrayOf_Llaughedelic_atom_ide_scala_ServerType = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Llaughedelic_atom_ide_scala_ServerType)))
});
class $c_O {
  init___() {
    return this
  };
  equals__O__Z(that) {
    return (this === that)
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
const $is_jl_Runnable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Runnable)))
});
const $isArrayOf_jl_Runnable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Runnable)))
});
const $f_s_Proxy__equals__O__Z = (function($thiz, that) {
  return ((that !== null) && (((that === $thiz) || (that === $thiz.self$1)) || $objectEquals(that, $thiz.self$1)))
});
const $f_s_Proxy__toString__T = (function($thiz) {
  return ("" + $thiz.self$1)
});
const $is_s_concurrent_BlockContext = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_concurrent_BlockContext)))
});
const $isArrayOf_s_concurrent_BlockContext = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_concurrent_BlockContext)))
});
const $is_s_concurrent_OnCompleteRunnable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_concurrent_OnCompleteRunnable)))
});
const $isArrayOf_s_concurrent_OnCompleteRunnable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_concurrent_OnCompleteRunnable)))
});
const $f_s_concurrent_Promise__failure__jl_Throwable__s_concurrent_Promise = (function($thiz, cause) {
  const result = new $c_s_util_Failure().init___jl_Throwable(cause);
  return $f_s_concurrent_Promise__complete__s_util_Try__s_concurrent_Promise($thiz, result)
});
const $f_s_concurrent_Promise__tryCompleteWith__s_concurrent_Future__s_concurrent_Promise = (function($thiz, other) {
  if ((other !== $thiz)) {
    other.onComplete__F1__s_concurrent_ExecutionContext__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
      return (function(x$1$2) {
        const x$1 = x$1$2;
        return $this.tryComplete__s_util_Try__Z(x$1)
      })
    })($thiz)), $m_s_concurrent_Future$InternalCallbackExecutor$())
  };
  return $thiz
});
const $f_s_concurrent_Promise__complete__s_util_Try__s_concurrent_Promise = (function($thiz, result) {
  if ($thiz.tryComplete__s_util_Try__Z(result)) {
    return $thiz
  } else {
    throw new $c_jl_IllegalStateException().init___T("Promise already completed.")
  }
});
const $f_s_concurrent_Promise__success__O__s_concurrent_Promise = (function($thiz, value) {
  const result = new $c_s_util_Success().init___O(value);
  return $f_s_concurrent_Promise__complete__s_util_Try__s_concurrent_Promise($thiz, result)
});
const $f_s_util_control_NoStackTrace__fillInStackTrace__jl_Throwable = (function($thiz) {
  const this$1 = $m_s_util_control_NoStackTrace$();
  if (this$1.$$undnoSuppression$1) {
    return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call($thiz)
  } else {
    return $thiz
  }
});
const $is_sc_GenTraversableOnce = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversableOnce)))
});
const $isArrayOf_sc_GenTraversableOnce = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversableOnce)))
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
const $f_sci_VectorPointer__gotoFreshPosWritable1__I__I__I__V = (function($thiz, oldIndex, newIndex, xor) {
  $f_sci_VectorPointer__stabilize__I__V($thiz, oldIndex);
  $f_sci_VectorPointer__gotoFreshPosWritable0__I__I__I__V($thiz, oldIndex, newIndex, xor)
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
const $f_sci_VectorPointer__gotoFreshPosWritable0__I__I__I__V = (function($thiz, oldIndex, newIndex, xor) {
  if ((xor >= 32)) {
    if ((xor < 1024)) {
      if (($thiz.depth__I() === 1)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display1__AO().u[(31 & ((oldIndex >>> 5) | 0))] = $thiz.display0__AO();
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 32768)) {
      if (($thiz.depth__I() === 2)) {
        $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display2__AO().u[(31 & ((oldIndex >>> 10) | 0))] = $thiz.display1__AO();
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display1$und$eq__AO__V($thiz.display2__AO().u[(31 & ((newIndex >>> 10) | 0))]);
      if (($thiz.display1__AO() === null)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 1048576)) {
      if (($thiz.depth__I() === 3)) {
        $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display3__AO().u[(31 & ((oldIndex >>> 15) | 0))] = $thiz.display2__AO();
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display2$und$eq__AO__V($thiz.display3__AO().u[(31 & ((newIndex >>> 15) | 0))]);
      if (($thiz.display2__AO() === null)) {
        $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display1$und$eq__AO__V($thiz.display2__AO().u[(31 & ((newIndex >>> 10) | 0))]);
      if (($thiz.display1__AO() === null)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 33554432)) {
      if (($thiz.depth__I() === 4)) {
        $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display4__AO().u[(31 & ((oldIndex >>> 20) | 0))] = $thiz.display3__AO();
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display3$und$eq__AO__V($thiz.display4__AO().u[(31 & ((newIndex >>> 20) | 0))]);
      if (($thiz.display3__AO() === null)) {
        $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display2$und$eq__AO__V($thiz.display3__AO().u[(31 & ((newIndex >>> 15) | 0))]);
      if (($thiz.display2__AO() === null)) {
        $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display1$und$eq__AO__V($thiz.display2__AO().u[(31 & ((newIndex >>> 10) | 0))]);
      if (($thiz.display1__AO() === null)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 1073741824)) {
      if (($thiz.depth__I() === 5)) {
        $thiz.display5$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display5__AO().u[(31 & ((oldIndex >>> 25) | 0))] = $thiz.display4__AO();
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display4$und$eq__AO__V($thiz.display5__AO().u[(31 & ((newIndex >>> 25) | 0))]);
      if (($thiz.display4__AO() === null)) {
        $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display3$und$eq__AO__V($thiz.display4__AO().u[(31 & ((newIndex >>> 20) | 0))]);
      if (($thiz.display3__AO() === null)) {
        $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display2$und$eq__AO__V($thiz.display3__AO().u[(31 & ((newIndex >>> 15) | 0))]);
      if (($thiz.display2__AO() === null)) {
        $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display1$und$eq__AO__V($thiz.display2__AO().u[(31 & ((newIndex >>> 10) | 0))]);
      if (($thiz.display1__AO() === null)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else {
      throw new $c_jl_IllegalArgumentException().init___()
    }
  }
});
const $f_sci_VectorPointer__gotoPosWritable1__I__I__I__V = (function($thiz, oldIndex, newIndex, xor) {
  if ((xor < 32)) {
    const a = $thiz.display0__AO();
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a))
  } else if ((xor < 1024)) {
    const a$1 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$1));
    $thiz.display1__AO().u[(31 & ((oldIndex >>> 5) | 0))] = $thiz.display0__AO();
    const array = $thiz.display1__AO();
    const index = (31 & ((newIndex >>> 5) | 0));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array, index))
  } else if ((xor < 32768)) {
    const a$2 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$2));
    const a$3 = $thiz.display2__AO();
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$3));
    $thiz.display1__AO().u[(31 & ((oldIndex >>> 5) | 0))] = $thiz.display0__AO();
    $thiz.display2__AO().u[(31 & ((oldIndex >>> 10) | 0))] = $thiz.display1__AO();
    const array$1 = $thiz.display2__AO();
    const index$1 = (31 & ((newIndex >>> 10) | 0));
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$1, index$1));
    const array$2 = $thiz.display1__AO();
    const index$2 = (31 & ((newIndex >>> 5) | 0));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$2, index$2))
  } else if ((xor < 1048576)) {
    const a$4 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$4));
    const a$5 = $thiz.display2__AO();
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$5));
    const a$6 = $thiz.display3__AO();
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$6));
    $thiz.display1__AO().u[(31 & ((oldIndex >>> 5) | 0))] = $thiz.display0__AO();
    $thiz.display2__AO().u[(31 & ((oldIndex >>> 10) | 0))] = $thiz.display1__AO();
    $thiz.display3__AO().u[(31 & ((oldIndex >>> 15) | 0))] = $thiz.display2__AO();
    const array$3 = $thiz.display3__AO();
    const index$3 = (31 & ((newIndex >>> 15) | 0));
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$3, index$3));
    const array$4 = $thiz.display2__AO();
    const index$4 = (31 & ((newIndex >>> 10) | 0));
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$4, index$4));
    const array$5 = $thiz.display1__AO();
    const index$5 = (31 & ((newIndex >>> 5) | 0));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$5, index$5))
  } else if ((xor < 33554432)) {
    const a$7 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$7));
    const a$8 = $thiz.display2__AO();
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$8));
    const a$9 = $thiz.display3__AO();
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$9));
    const a$10 = $thiz.display4__AO();
    $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$10));
    $thiz.display1__AO().u[(31 & ((oldIndex >>> 5) | 0))] = $thiz.display0__AO();
    $thiz.display2__AO().u[(31 & ((oldIndex >>> 10) | 0))] = $thiz.display1__AO();
    $thiz.display3__AO().u[(31 & ((oldIndex >>> 15) | 0))] = $thiz.display2__AO();
    $thiz.display4__AO().u[(31 & ((oldIndex >>> 20) | 0))] = $thiz.display3__AO();
    const array$6 = $thiz.display4__AO();
    const index$6 = (31 & ((newIndex >>> 20) | 0));
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$6, index$6));
    const array$7 = $thiz.display3__AO();
    const index$7 = (31 & ((newIndex >>> 15) | 0));
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$7, index$7));
    const array$8 = $thiz.display2__AO();
    const index$8 = (31 & ((newIndex >>> 10) | 0));
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$8, index$8));
    const array$9 = $thiz.display1__AO();
    const index$9 = (31 & ((newIndex >>> 5) | 0));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$9, index$9))
  } else if ((xor < 1073741824)) {
    const a$11 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$11));
    const a$12 = $thiz.display2__AO();
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$12));
    const a$13 = $thiz.display3__AO();
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$13));
    const a$14 = $thiz.display4__AO();
    $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$14));
    const a$15 = $thiz.display5__AO();
    $thiz.display5$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$15));
    $thiz.display1__AO().u[(31 & ((oldIndex >>> 5) | 0))] = $thiz.display0__AO();
    $thiz.display2__AO().u[(31 & ((oldIndex >>> 10) | 0))] = $thiz.display1__AO();
    $thiz.display3__AO().u[(31 & ((oldIndex >>> 15) | 0))] = $thiz.display2__AO();
    $thiz.display4__AO().u[(31 & ((oldIndex >>> 20) | 0))] = $thiz.display3__AO();
    $thiz.display5__AO().u[(31 & ((oldIndex >>> 25) | 0))] = $thiz.display4__AO();
    const array$10 = $thiz.display5__AO();
    const index$10 = (31 & ((newIndex >>> 25) | 0));
    $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$10, index$10));
    const array$11 = $thiz.display4__AO();
    const index$11 = (31 & ((newIndex >>> 20) | 0));
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$11, index$11));
    const array$12 = $thiz.display3__AO();
    const index$12 = (31 & ((newIndex >>> 15) | 0));
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$12, index$12));
    const array$13 = $thiz.display2__AO();
    const index$13 = (31 & ((newIndex >>> 10) | 0));
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$13, index$13));
    const array$14 = $thiz.display1__AO();
    const index$14 = (31 & ((newIndex >>> 5) | 0));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$14, index$14))
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
});
const $f_sci_VectorPointer__copyRange__AO__I__I__AO = (function($thiz, array, oldLeft, newLeft) {
  const elems = $newArrayObject($d_O.getArrayOf(), [32]);
  $systemArraycopy(array, oldLeft, elems, newLeft, ((32 - ((newLeft > oldLeft) ? newLeft : oldLeft)) | 0));
  return elems
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
const $f_sci_VectorPointer__gotoPosWritable0__I__I__V = (function($thiz, newIndex, xor) {
  const x1 = (((-1) + $thiz.depth__I()) | 0);
  switch (x1) {
    case 5: {
      const a = $thiz.display5__AO();
      $thiz.display5$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a));
      const array = $thiz.display5__AO();
      const index = (31 & ((newIndex >>> 25) | 0));
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array, index));
      const array$1 = $thiz.display4__AO();
      const index$1 = (31 & ((newIndex >>> 20) | 0));
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$1, index$1));
      const array$2 = $thiz.display3__AO();
      const index$2 = (31 & ((newIndex >>> 15) | 0));
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$2, index$2));
      const array$3 = $thiz.display2__AO();
      const index$3 = (31 & ((newIndex >>> 10) | 0));
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$3, index$3));
      const array$4 = $thiz.display1__AO();
      const index$4 = (31 & ((newIndex >>> 5) | 0));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$4, index$4));
      break
    }
    case 4: {
      const a$1 = $thiz.display4__AO();
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$1));
      const array$5 = $thiz.display4__AO();
      const index$5 = (31 & ((newIndex >>> 20) | 0));
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$5, index$5));
      const array$6 = $thiz.display3__AO();
      const index$6 = (31 & ((newIndex >>> 15) | 0));
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$6, index$6));
      const array$7 = $thiz.display2__AO();
      const index$7 = (31 & ((newIndex >>> 10) | 0));
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$7, index$7));
      const array$8 = $thiz.display1__AO();
      const index$8 = (31 & ((newIndex >>> 5) | 0));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$8, index$8));
      break
    }
    case 3: {
      const a$2 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$2));
      const array$9 = $thiz.display3__AO();
      const index$9 = (31 & ((newIndex >>> 15) | 0));
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$9, index$9));
      const array$10 = $thiz.display2__AO();
      const index$10 = (31 & ((newIndex >>> 10) | 0));
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$10, index$10));
      const array$11 = $thiz.display1__AO();
      const index$11 = (31 & ((newIndex >>> 5) | 0));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$11, index$11));
      break
    }
    case 2: {
      const a$3 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$3));
      const array$12 = $thiz.display2__AO();
      const index$12 = (31 & ((newIndex >>> 10) | 0));
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$12, index$12));
      const array$13 = $thiz.display1__AO();
      const index$13 = (31 & ((newIndex >>> 5) | 0));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$13, index$13));
      break
    }
    case 1: {
      const a$4 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$4));
      const array$14 = $thiz.display1__AO();
      const index$14 = (31 & ((newIndex >>> 5) | 0));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$14, index$14));
      break
    }
    case 0: {
      const a$5 = $thiz.display0__AO();
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$5));
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
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
const $f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO = (function($thiz, array, index) {
  const x = array.u[index];
  array.u[index] = null;
  const a = x;
  return $f_sci_VectorPointer__copyOf__AO__AO($thiz, a)
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
const $f_sci_VectorPointer__gotoNextBlockStartWritable__I__I__V = (function($thiz, index, xor) {
  if ((xor < 1024)) {
    if (($thiz.depth__I() === 1)) {
      $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display1__AO().u[0] = $thiz.display0__AO();
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().u[(31 & ((index >>> 5) | 0))] = $thiz.display0__AO()
  } else if ((xor < 32768)) {
    if (($thiz.depth__I() === 2)) {
      $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display2__AO().u[0] = $thiz.display1__AO();
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().u[(31 & ((index >>> 5) | 0))] = $thiz.display0__AO();
    $thiz.display2__AO().u[(31 & ((index >>> 10) | 0))] = $thiz.display1__AO()
  } else if ((xor < 1048576)) {
    if (($thiz.depth__I() === 3)) {
      $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display3__AO().u[0] = $thiz.display2__AO();
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().u[(31 & ((index >>> 5) | 0))] = $thiz.display0__AO();
    $thiz.display2__AO().u[(31 & ((index >>> 10) | 0))] = $thiz.display1__AO();
    $thiz.display3__AO().u[(31 & ((index >>> 15) | 0))] = $thiz.display2__AO()
  } else if ((xor < 33554432)) {
    if (($thiz.depth__I() === 4)) {
      $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display4__AO().u[0] = $thiz.display3__AO();
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().u[(31 & ((index >>> 5) | 0))] = $thiz.display0__AO();
    $thiz.display2__AO().u[(31 & ((index >>> 10) | 0))] = $thiz.display1__AO();
    $thiz.display3__AO().u[(31 & ((index >>> 15) | 0))] = $thiz.display2__AO();
    $thiz.display4__AO().u[(31 & ((index >>> 20) | 0))] = $thiz.display3__AO()
  } else if ((xor < 1073741824)) {
    if (($thiz.depth__I() === 5)) {
      $thiz.display5$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display5__AO().u[0] = $thiz.display4__AO();
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().u[(31 & ((index >>> 5) | 0))] = $thiz.display0__AO();
    $thiz.display2__AO().u[(31 & ((index >>> 10) | 0))] = $thiz.display1__AO();
    $thiz.display3__AO().u[(31 & ((index >>> 15) | 0))] = $thiz.display2__AO();
    $thiz.display4__AO().u[(31 & ((index >>> 20) | 0))] = $thiz.display3__AO();
    $thiz.display5__AO().u[(31 & ((index >>> 25) | 0))] = $thiz.display4__AO()
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
});
class $c_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$ extends $c_O {
  init___() {
    return this
  };
  $$lessinit$greater$default$7__sjs_js_UndefOr() {
    return (void 0)
  };
  $$lessinit$greater$default$4__sjs_js_UndefOr() {
    return (void 0)
  };
  $$lessinit$greater$default$1__sjs_js_UndefOr() {
    return (void 0)
  };
  $$lessinit$greater$default$8__sjs_js_UndefOr() {
    return (void 0)
  };
  $$lessinit$greater$default$5__sjs_js_UndefOr() {
    return (void 0)
  };
  $$lessinit$greater$default$6__sjs_js_UndefOr() {
    return (void 0)
  };
  $$lessinit$greater$default$3__sjs_js_UndefOr() {
    return (void 0)
  };
  $$lessinit$greater$default$2__sjs_js_Any() {
    return (void 0)
  };
}
const $d_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$ = new $TypeData().initClass({
  Lio_scalajs_nodejs_child$undprocess_SpawnOptions$: 0
}, false, "io.scalajs.nodejs.child_process.SpawnOptions$", {
  Lio_scalajs_nodejs_child$undprocess_SpawnOptions$: 1,
  O: 1
});
$c_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$.prototype.$classData = $d_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$;
let $n_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$ = (void 0);
const $m_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$ = (function() {
  if ((!$n_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$)) {
    $n_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$ = new $c_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$().init___()
  };
  return $n_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$
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
  consumeSignatureHelp__sjs_js_Any__sjs_js_Any(registry) {
    return this.client$1.consumeSignatureHelp(registry)
  };
  deactivate__sjs_js_Promise() {
    return this.client$1.deactivate()
  };
  consumeBusySignal__Llaughedelic_atom_ide_ui_busysignal_BusySignalService__V(service) {
    this.client$1.consumeBusySignal(service)
  };
  provideCodeHighlight__sjs_js_Any() {
    return this.client$1.provideCodeHighlight()
  };
  consumeLinterV2__sjs_js_Any__V(registerIndie) {
    this.client$1.consumeLinterV2(registerIndie)
  };
  provideDefinitions__sjs_js_Any() {
    return this.client$1.provideDefinitions()
  };
  provideFindReferences__sjs_js_Any() {
    return this.client$1.provideFindReferences()
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
class $c_Llaughedelic_atom_ide_scala_findJavaHome$ extends $c_O {
  init___() {
    return this
  };
  withCallback__Z__F2__V(allowJre, callback) {
    $i_find$002djava$002dhome({
      "allowJre": allowJre
    }, (function($this, callback$1) {
      return (function(err$2, home$2) {
        const home = home$2;
        callback$1.apply__O__O__O(err$2, home)
      })
    })(this, callback))
  };
  apply__Z__s_concurrent_Future(allowJre) {
    const p = new $c_s_concurrent_impl_Promise$DefaultPromise().init___();
    this.withCallback__Z__F2__V(allowJre, new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this, p$1) {
      return (function(err$2, home$2) {
        const home = home$2;
        if ((err$2 !== null)) {
          throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new $c_jl_RuntimeException().init___T($objectToString(err$2)))
        } else {
          $f_s_concurrent_Promise__success__O__s_concurrent_Promise(p$1, home)
        }
      })
    })(this, p)));
    return p
  };
}
const $d_Llaughedelic_atom_ide_scala_findJavaHome$ = new $TypeData().initClass({
  Llaughedelic_atom_ide_scala_findJavaHome$: 0
}, false, "laughedelic.atom.ide.scala.findJavaHome$", {
  Llaughedelic_atom_ide_scala_findJavaHome$: 1,
  O: 1
});
$c_Llaughedelic_atom_ide_scala_findJavaHome$.prototype.$classData = $d_Llaughedelic_atom_ide_scala_findJavaHome$;
let $n_Llaughedelic_atom_ide_scala_findJavaHome$ = (void 0);
const $m_Llaughedelic_atom_ide_scala_findJavaHome$ = (function() {
  if ((!$n_Llaughedelic_atom_ide_scala_findJavaHome$)) {
    $n_Llaughedelic_atom_ide_scala_findJavaHome$ = new $c_Llaughedelic_atom_ide_scala_findJavaHome$().init___()
  };
  return $n_Llaughedelic_atom_ide_scala_findJavaHome$
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
  isAssignableFrom__jl_Class__Z(that) {
    return ((this.isPrimitive__Z() || that.isPrimitive__Z()) ? ((this === that) || ((this === $d_S.getClassOf()) ? (that === $d_B.getClassOf()) : ((this === $d_I.getClassOf()) ? ((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) : ((this === $d_F.getClassOf()) ? (((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) : ((this === $d_D.getClassOf()) && ((((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) || (that === $d_F.getClassOf()))))))) : this.isInstance__O__Z(that.getFakeInstance__p1__O()))
  };
  isInstance__O__Z(obj) {
    return (!(!this.data$1.isInstance(obj)))
  };
  init___jl_ScalaJSClassData(data) {
    this.data$1 = data;
    return this
  };
  getFakeInstance__p1__O() {
    return this.data$1.getFakeInstance()
  };
  isArray__Z() {
    return (!(!this.data$1.isArrayClass))
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
class $c_jl_System$ extends $c_O {
  constructor() {
    super();
    this.out$1 = null;
    this.err$1 = null;
    this.in$1 = null;
    this.getHighPrecisionTime$1 = null
  };
  init___() {
    $n_jl_System$ = this;
    this.out$1 = new $c_jl_JSConsoleBasedPrintStream().init___jl_Boolean(false);
    this.err$1 = new $c_jl_JSConsoleBasedPrintStream().init___jl_Boolean(true);
    this.in$1 = null;
    const x = $g.performance;
    let jsx$1;
    if ((!(!(!(!x))))) {
      const x$1 = $g.performance.now;
      if ((!(!(!(!x$1))))) {
        jsx$1 = (function() {
          return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$1__D()
        })
      } else {
        const x$2 = $g.performance.webkitNow;
        if ((!(!(!(!x$2))))) {
          jsx$1 = (function() {
            return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$2__D()
          })
        } else {
          jsx$1 = (function() {
            return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$3__D()
          })
        }
      }
    } else {
      jsx$1 = (function() {
        return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$4__D()
      })
    };
    this.getHighPrecisionTime$1 = jsx$1;
    return this
  };
  java$lang$System$$$anonfun$getHighPrecisionTime$3__D() {
    return (+new $g.Date().getTime())
  };
  java$lang$System$$$anonfun$getHighPrecisionTime$1__D() {
    return (+$g.performance.now())
  };
  java$lang$System$$$anonfun$getHighPrecisionTime$4__D() {
    return (+new $g.Date().getTime())
  };
  java$lang$System$$$anonfun$getHighPrecisionTime$2__D() {
    return (+$g.performance.webkitNow())
  };
}
const $d_jl_System$ = new $TypeData().initClass({
  jl_System$: 0
}, false, "java.lang.System$", {
  jl_System$: 1,
  O: 1
});
$c_jl_System$.prototype.$classData = $d_jl_System$;
let $n_jl_System$ = (void 0);
const $m_jl_System$ = (function() {
  if ((!$n_jl_System$)) {
    $n_jl_System$ = new $c_jl_System$().init___()
  };
  return $n_jl_System$
});
class $c_jl_Thread$ extends $c_O {
  constructor() {
    super();
    this.SingleThread$1 = null
  };
  init___() {
    $n_jl_Thread$ = this;
    this.SingleThread$1 = new $c_jl_Thread().init___sr_BoxedUnit((void 0));
    return this
  };
}
const $d_jl_Thread$ = new $TypeData().initClass({
  jl_Thread$: 0
}, false, "java.lang.Thread$", {
  jl_Thread$: 1,
  O: 1
});
$c_jl_Thread$.prototype.$classData = $d_jl_Thread$;
let $n_jl_Thread$ = (void 0);
const $m_jl_Thread$ = (function() {
  if ((!$n_jl_Thread$)) {
    $n_jl_Thread$ = new $c_jl_Thread$().init___()
  };
  return $n_jl_Thread$
});
class $c_jl_ThreadLocal extends $c_O {
  constructor() {
    super();
    this.hasValue$1 = null;
    this.v$1 = null
  };
  init___() {
    this.hasValue$1 = false;
    return this
  };
  remove__V() {
    this.hasValue$1 = false;
    this.v$1 = null
  };
  get__O() {
    const x = this.hasValue$1;
    if ((!(!(!x)))) {
      this.set__O__V(null)
    };
    return this.v$1
  };
  set__O__V(o) {
    this.v$1 = o;
    this.hasValue$1 = true
  };
}
const $d_jl_ThreadLocal = new $TypeData().initClass({
  jl_ThreadLocal: 0
}, false, "java.lang.ThreadLocal", {
  jl_ThreadLocal: 1,
  O: 1
});
$c_jl_ThreadLocal.prototype.$classData = $d_jl_ThreadLocal;
class $c_s_DeprecatedConsole extends $c_O {
}
class $c_s_FallbackArrayBuilding extends $c_O {
}
class $c_s_LowPriorityImplicits extends $c_O {
}
const $f_s_PartialFunction__applyOrElse__O__F1__O = (function($thiz, x, $default) {
  return ($thiz.isDefinedAt__O__Z(x) ? $thiz.apply__O__O(x) : $default.apply__O__O(x))
});
class $c_s_PartialFunction$ extends $c_O {
  constructor() {
    super();
    this.scala$PartialFunction$$fallback$undpf$f = null;
    this.scala$PartialFunction$$constFalse$f = null;
    this.empty$undpf$1 = null
  };
  init___() {
    $n_s_PartialFunction$ = this;
    this.scala$PartialFunction$$fallback$undpf$f = new $c_s_PartialFunction$$anonfun$1().init___();
    this.scala$PartialFunction$$constFalse$f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
      return (function(x$1$2) {
        return false
      })
    })(this));
    this.empty$undpf$1 = new $c_s_PartialFunction$$anon$1().init___();
    return this
  };
}
const $d_s_PartialFunction$ = new $TypeData().initClass({
  s_PartialFunction$: 0
}, false, "scala.PartialFunction$", {
  s_PartialFunction$: 1,
  O: 1
});
$c_s_PartialFunction$.prototype.$classData = $d_s_PartialFunction$;
let $n_s_PartialFunction$ = (void 0);
const $m_s_PartialFunction$ = (function() {
  if ((!$n_s_PartialFunction$)) {
    $n_s_PartialFunction$ = new $c_s_PartialFunction$().init___()
  };
  return $n_s_PartialFunction$
});
class $c_s_Predef$any2stringadd$ extends $c_O {
  init___() {
    return this
  };
  $$plus$extension__O__T__T($$this, other) {
    return (("" + $$this) + other)
  };
}
const $d_s_Predef$any2stringadd$ = new $TypeData().initClass({
  s_Predef$any2stringadd$: 0
}, false, "scala.Predef$any2stringadd$", {
  s_Predef$any2stringadd$: 1,
  O: 1
});
$c_s_Predef$any2stringadd$.prototype.$classData = $d_s_Predef$any2stringadd$;
let $n_s_Predef$any2stringadd$ = (void 0);
const $m_s_Predef$any2stringadd$ = (function() {
  if ((!$n_s_Predef$any2stringadd$)) {
    $n_s_Predef$any2stringadd$ = new $c_s_Predef$any2stringadd$().init___()
  };
  return $n_s_Predef$any2stringadd$
});
const $f_s_concurrent_BatchingExecutor__batchable__jl_Runnable__Z = (function($thiz, runnable) {
  return $is_s_concurrent_OnCompleteRunnable(runnable)
});
const $f_s_concurrent_BatchingExecutor__execute__jl_Runnable__V = (function($thiz, runnable) {
  if ($f_s_concurrent_BatchingExecutor__batchable__jl_Runnable__Z($thiz, runnable)) {
    const x1 = $thiz.scala$concurrent$BatchingExecutor$$$undtasksLocal$1.get__O();
    if ((x1 === null)) {
      const this$1 = $m_sci_Nil$();
      const r = new $c_s_concurrent_BatchingExecutor$Batch().init___s_concurrent_BatchingExecutor__sci_List($thiz, new $c_sci_$colon$colon().init___O__sci_List(runnable, this$1));
      r.run__V()
    } else {
      $thiz.scala$concurrent$BatchingExecutor$$$undtasksLocal$1.set__O__V(new $c_sci_$colon$colon().init___O__sci_List(runnable, x1))
    }
  } else {
    runnable.run__V()
  }
});
class $c_s_concurrent_BlockContext$ extends $c_O {
  constructor() {
    super();
    this.contextLocal$1 = null
  };
  init___() {
    $n_s_concurrent_BlockContext$ = this;
    this.contextLocal$1 = new $c_jl_ThreadLocal().init___();
    return this
  };
  current__s_concurrent_BlockContext() {
    const x1 = this.contextLocal$1.get__O();
    if ((x1 === null)) {
      const x1$2 = $m_jl_Thread$().SingleThread$1;
      return ($is_s_concurrent_BlockContext(x1$2) ? x1$2 : $m_s_concurrent_BlockContext$DefaultBlockContext$())
    } else {
      return x1
    }
  };
}
const $d_s_concurrent_BlockContext$ = new $TypeData().initClass({
  s_concurrent_BlockContext$: 0
}, false, "scala.concurrent.BlockContext$", {
  s_concurrent_BlockContext$: 1,
  O: 1
});
$c_s_concurrent_BlockContext$.prototype.$classData = $d_s_concurrent_BlockContext$;
let $n_s_concurrent_BlockContext$ = (void 0);
const $m_s_concurrent_BlockContext$ = (function() {
  if ((!$n_s_concurrent_BlockContext$)) {
    $n_s_concurrent_BlockContext$ = new $c_s_concurrent_BlockContext$().init___()
  };
  return $n_s_concurrent_BlockContext$
});
class $c_s_concurrent_ExecutionContext$Implicits$ extends $c_O {
  constructor() {
    super();
    this.global$1 = null;
    this.bitmap$0$1 = false
  };
  init___() {
    return this
  };
  global$lzycompute__p1__s_concurrent_ExecutionContext() {
    if ((!this.bitmap$0$1)) {
      this.global$1 = $m_sjs_concurrent_JSExecutionContext$().queue$1;
      this.bitmap$0$1 = true
    };
    return this.global$1
  };
  global__s_concurrent_ExecutionContext() {
    return ((!this.bitmap$0$1) ? this.global$lzycompute__p1__s_concurrent_ExecutionContext() : this.global$1)
  };
}
const $d_s_concurrent_ExecutionContext$Implicits$ = new $TypeData().initClass({
  s_concurrent_ExecutionContext$Implicits$: 0
}, false, "scala.concurrent.ExecutionContext$Implicits$", {
  s_concurrent_ExecutionContext$Implicits$: 1,
  O: 1
});
$c_s_concurrent_ExecutionContext$Implicits$.prototype.$classData = $d_s_concurrent_ExecutionContext$Implicits$;
let $n_s_concurrent_ExecutionContext$Implicits$ = (void 0);
const $m_s_concurrent_ExecutionContext$Implicits$ = (function() {
  if ((!$n_s_concurrent_ExecutionContext$Implicits$)) {
    $n_s_concurrent_ExecutionContext$Implicits$ = new $c_s_concurrent_ExecutionContext$Implicits$().init___()
  };
  return $n_s_concurrent_ExecutionContext$Implicits$
});
const $f_s_concurrent_Future__transform__F1__F1__s_concurrent_ExecutionContext__s_concurrent_Future = (function($thiz, s, f, executor) {
  const f$2 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, s$1, f$1) {
    return (function(x0$4$2) {
      const x0$4 = x0$4$2;
      if ($is_s_util_Success(x0$4)) {
        const x2 = x0$4;
        const r = x2.value$2;
        try {
          return new $c_s_util_Success().init___O(s$1.apply__O__O(r))
        } catch (e) {
          const e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
          if ((e$2 !== null)) {
            const o11 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2);
            if ((!o11.isEmpty__Z())) {
              const e$3 = o11.get__O();
              return new $c_s_util_Failure().init___jl_Throwable(e$3)
            };
            throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
          } else {
            throw e
          }
        }
      } else if ($is_s_util_Failure(x0$4)) {
        const x3 = x0$4;
        const t = x3.exception$2;
        try {
          let jsx$1;
          throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(f$1.apply__O__O(t));
          return new $c_s_util_Success().init___O(jsx$1)
        } catch (e$1) {
          const e$2$1 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e$1);
          if ((e$2$1 !== null)) {
            const o11$1 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2$1);
            if ((!o11$1.isEmpty__Z())) {
              const e$3$1 = o11$1.get__O();
              return new $c_s_util_Failure().init___jl_Throwable(e$3$1)
            };
            throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2$1)
          } else {
            throw e$1
          }
        }
      } else {
        throw new $c_s_MatchError().init___O(x0$4)
      }
    })
  })($thiz, s, f));
  return $f_s_concurrent_impl_Promise__transform__F1__s_concurrent_ExecutionContext__s_concurrent_Future($thiz, f$2, executor)
});
const $f_s_concurrent_Future__fallbackTo__s_concurrent_Future__s_concurrent_Future = (function($thiz, that) {
  if (($thiz === that)) {
    return $thiz
  } else {
    const ec = $m_s_concurrent_Future$InternalCallbackExecutor$();
    return $thiz.recoverWith__s_PartialFunction__s_concurrent_ExecutionContext__s_concurrent_Future(new $c_s_concurrent_Future$$anonfun$fallbackTo$1().init___s_concurrent_Future__s_concurrent_Future($thiz, that), ec).recoverWith__s_PartialFunction__s_concurrent_ExecutionContext__s_concurrent_Future(new $c_s_concurrent_Future$$anonfun$fallbackTo$2().init___s_concurrent_Future($thiz), ec)
  }
});
const $f_s_concurrent_Future__map__F1__s_concurrent_ExecutionContext__s_concurrent_Future = (function($thiz, f, executor) {
  const f$2 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, f$1) {
    return (function(x$2$2) {
      const x$2 = x$2$2;
      return x$2.map__F1__s_util_Try(f$1)
    })
  })($thiz, f));
  return $f_s_concurrent_impl_Promise__transform__F1__s_concurrent_ExecutionContext__s_concurrent_Future($thiz, f$2, executor)
});
const $f_s_concurrent_Future__filter__F1__s_concurrent_ExecutionContext__s_concurrent_Future = (function($thiz, p, executor) {
  return $thiz.map__F1__s_concurrent_ExecutionContext__s_concurrent_Future(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, p$1) {
    return (function(r$2) {
      if ((!(!p$1.apply__O__O(r$2)))) {
        return r$2
      } else {
        throw new $c_ju_NoSuchElementException().init___T("Future.filter predicate is not satisfied")
      }
    })
  })($thiz, p)), executor)
});
const $f_s_concurrent_Future__recoverWith__s_PartialFunction__s_concurrent_ExecutionContext__s_concurrent_Future = (function($thiz, pf, executor) {
  const f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, pf$1) {
    return (function(x0$6$2) {
      const x0$6 = x0$6$2;
      if ($is_s_util_Failure(x0$6)) {
        const x2 = x0$6;
        const t = x2.exception$2;
        return pf$1.applyOrElse__O__F1__O(t, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1) {
          return (function(x$4$2) {
            return $this$1
          })
        })($this)))
      } else if ($is_s_util_Success(x0$6)) {
        return $this
      } else {
        throw new $c_s_MatchError().init___O(x0$6)
      }
    })
  })($thiz, pf));
  return $f_s_concurrent_impl_Promise__transformWith__F1__s_concurrent_ExecutionContext__s_concurrent_Future($thiz, f, executor)
});
const $is_s_concurrent_Future = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_concurrent_Future)))
});
const $isArrayOf_s_concurrent_Future = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_concurrent_Future)))
});
class $c_s_concurrent_Future$ extends $c_O {
  constructor() {
    super();
    this.toBoxed$1 = null;
    this.unit$1 = null
  };
  init___() {
    $n_s_concurrent_Future$ = this;
    const array = [new $c_T2().init___O__O($d_Z.getClassOf(), $d_jl_Boolean.getClassOf()), new $c_T2().init___O__O($d_B.getClassOf(), $d_jl_Byte.getClassOf()), new $c_T2().init___O__O($d_C.getClassOf(), $d_jl_Character.getClassOf()), new $c_T2().init___O__O($d_S.getClassOf(), $d_jl_Short.getClassOf()), new $c_T2().init___O__O($d_I.getClassOf(), $d_jl_Integer.getClassOf()), new $c_T2().init___O__O($d_J.getClassOf(), $d_jl_Long.getClassOf()), new $c_T2().init___O__O($d_F.getClassOf(), $d_jl_Float.getClassOf()), new $c_T2().init___O__O($d_D.getClassOf(), $d_jl_Double.getClassOf()), new $c_T2().init___O__O($d_V.getClassOf(), $d_sr_BoxedUnit.getClassOf())];
    const this$20 = new $c_scm_MapBuilder().init___sc_GenMap($m_sci_Map$EmptyMap$());
    let i = 0;
    const len = (array.length | 0);
    while ((i < len)) {
      const index = i;
      const arg1 = array[index];
      this$20.$$plus$eq__T2__scm_MapBuilder(arg1);
      i = ((1 + i) | 0)
    };
    this.toBoxed$1 = this$20.elems$1;
    this.unit$1 = this.successful__O__s_concurrent_Future((void 0));
    return this
  };
  successful__O__s_concurrent_Future(result) {
    const this$1 = $m_s_concurrent_Promise$().successful__O__s_concurrent_Promise(result);
    return this$1
  };
  apply__F0__s_concurrent_ExecutionContext__s_concurrent_Future(body, executor) {
    return this.unit$1.map__F1__s_concurrent_ExecutionContext__s_concurrent_Future(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, body$1) {
      return (function(x$5$2) {
        return body$1.apply__O()
      })
    })(this, body)), executor)
  };
}
const $d_s_concurrent_Future$ = new $TypeData().initClass({
  s_concurrent_Future$: 0
}, false, "scala.concurrent.Future$", {
  s_concurrent_Future$: 1,
  O: 1
});
$c_s_concurrent_Future$.prototype.$classData = $d_s_concurrent_Future$;
let $n_s_concurrent_Future$ = (void 0);
const $m_s_concurrent_Future$ = (function() {
  if ((!$n_s_concurrent_Future$)) {
    $n_s_concurrent_Future$ = new $c_s_concurrent_Future$().init___()
  };
  return $n_s_concurrent_Future$
});
class $c_s_concurrent_Promise$ extends $c_O {
  init___() {
    return this
  };
  successful__O__s_concurrent_Promise(result) {
    const result$1 = new $c_s_util_Success().init___O(result);
    return $m_s_concurrent_impl_Promise$KeptPromise$().apply__s_util_Try__s_concurrent_Promise(result$1)
  };
}
const $d_s_concurrent_Promise$ = new $TypeData().initClass({
  s_concurrent_Promise$: 0
}, false, "scala.concurrent.Promise$", {
  s_concurrent_Promise$: 1,
  O: 1
});
$c_s_concurrent_Promise$.prototype.$classData = $d_s_concurrent_Promise$;
let $n_s_concurrent_Promise$ = (void 0);
const $m_s_concurrent_Promise$ = (function() {
  if ((!$n_s_concurrent_Promise$)) {
    $n_s_concurrent_Promise$ = new $c_s_concurrent_Promise$().init___()
  };
  return $n_s_concurrent_Promise$
});
class $c_s_concurrent_impl_Promise$ extends $c_O {
  init___() {
    return this
  };
  scala$concurrent$impl$Promise$$resolveTry__s_util_Try__s_util_Try(source) {
    if ($is_s_util_Failure(source)) {
      const x2 = source;
      const t = x2.exception$2;
      return this.resolver__p1__jl_Throwable__s_util_Try(t)
    } else {
      return source
    }
  };
  resolver__p1__jl_Throwable__s_util_Try(throwable) {
    if ($is_sr_NonLocalReturnControl(throwable)) {
      const x2 = throwable;
      return new $c_s_util_Success().init___O(x2.value__O())
    } else if ($is_s_util_control_ControlThrowable(throwable)) {
      const x3 = throwable;
      return new $c_s_util_Failure().init___jl_Throwable(new $c_ju_concurrent_ExecutionException().init___T__jl_Throwable("Boxed ControlThrowable", x3))
    } else if ($is_jl_InterruptedException(throwable)) {
      const x4 = throwable;
      return new $c_s_util_Failure().init___jl_Throwable(new $c_ju_concurrent_ExecutionException().init___T__jl_Throwable("Boxed InterruptedException", x4))
    } else if ($is_jl_Error(throwable)) {
      const x5 = throwable;
      return new $c_s_util_Failure().init___jl_Throwable(new $c_ju_concurrent_ExecutionException().init___T__jl_Throwable("Boxed Error", x5))
    } else {
      return new $c_s_util_Failure().init___jl_Throwable(throwable)
    }
  };
}
const $d_s_concurrent_impl_Promise$ = new $TypeData().initClass({
  s_concurrent_impl_Promise$: 0
}, false, "scala.concurrent.impl.Promise$", {
  s_concurrent_impl_Promise$: 1,
  O: 1
});
$c_s_concurrent_impl_Promise$.prototype.$classData = $d_s_concurrent_impl_Promise$;
let $n_s_concurrent_impl_Promise$ = (void 0);
const $m_s_concurrent_impl_Promise$ = (function() {
  if ((!$n_s_concurrent_impl_Promise$)) {
    $n_s_concurrent_impl_Promise$ = new $c_s_concurrent_impl_Promise$().init___()
  };
  return $n_s_concurrent_impl_Promise$
});
class $c_s_concurrent_impl_Promise$KeptPromise$ extends $c_O {
  init___() {
    return this
  };
  apply__s_util_Try__s_concurrent_Promise(result) {
    const x1 = $m_s_concurrent_impl_Promise$().scala$concurrent$impl$Promise$$resolveTry__s_util_Try__s_util_Try(result);
    if ($is_s_util_Success(x1)) {
      const x2 = x1;
      return new $c_s_concurrent_impl_Promise$KeptPromise$Successful().init___s_util_Success(x2)
    } else if ($is_s_util_Failure(x1)) {
      const x4 = x1;
      return new $c_s_concurrent_impl_Promise$KeptPromise$Failed().init___s_util_Failure(x4)
    } else {
      throw new $c_s_MatchError().init___O(x1)
    }
  };
}
const $d_s_concurrent_impl_Promise$KeptPromise$ = new $TypeData().initClass({
  s_concurrent_impl_Promise$KeptPromise$: 0
}, false, "scala.concurrent.impl.Promise$KeptPromise$", {
  s_concurrent_impl_Promise$KeptPromise$: 1,
  O: 1
});
$c_s_concurrent_impl_Promise$KeptPromise$.prototype.$classData = $d_s_concurrent_impl_Promise$KeptPromise$;
let $n_s_concurrent_impl_Promise$KeptPromise$ = (void 0);
const $m_s_concurrent_impl_Promise$KeptPromise$ = (function() {
  if ((!$n_s_concurrent_impl_Promise$KeptPromise$)) {
    $n_s_concurrent_impl_Promise$KeptPromise$ = new $c_s_concurrent_impl_Promise$KeptPromise$().init___()
  };
  return $n_s_concurrent_impl_Promise$KeptPromise$
});
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
class $c_s_util_DynamicVariable extends $c_O {
  constructor() {
    super();
    this.v$1 = null
  };
  toString__T() {
    return (("DynamicVariable(" + this.v$1) + ")")
  };
  init___O(init) {
    this.v$1 = init;
    return this
  };
}
const $d_s_util_DynamicVariable = new $TypeData().initClass({
  s_util_DynamicVariable: 0
}, false, "scala.util.DynamicVariable", {
  s_util_DynamicVariable: 1,
  O: 1
});
$c_s_util_DynamicVariable.prototype.$classData = $d_s_util_DynamicVariable;
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
const $is_s_util_control_ControlThrowable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_control_ControlThrowable)))
});
const $isArrayOf_s_util_control_ControlThrowable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_control_ControlThrowable)))
});
class $c_s_util_control_NonFatal$ extends $c_O {
  init___() {
    return this
  };
  apply__jl_Throwable__Z(t) {
    return (!($is_jl_VirtualMachineError(t) || ($is_jl_ThreadDeath(t) || ($is_jl_InterruptedException(t) || ($is_jl_LinkageError(t) || $is_s_util_control_ControlThrowable(t))))))
  };
  unapply__jl_Throwable__s_Option(t) {
    return (this.apply__jl_Throwable__Z(t) ? new $c_s_Some().init___O(t) : $m_s_None$())
  };
}
const $d_s_util_control_NonFatal$ = new $TypeData().initClass({
  s_util_control_NonFatal$: 0
}, false, "scala.util.control.NonFatal$", {
  s_util_control_NonFatal$: 1,
  O: 1
});
$c_s_util_control_NonFatal$.prototype.$classData = $d_s_util_control_NonFatal$;
let $n_s_util_control_NonFatal$ = (void 0);
const $m_s_util_control_NonFatal$ = (function() {
  if ((!$n_s_util_control_NonFatal$)) {
    $n_s_util_control_NonFatal$ = new $c_s_util_control_NonFatal$().init___()
  };
  return $n_s_util_control_NonFatal$
});
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
  unorderedHash__sc_TraversableOnce__I__I(xs, seed) {
    const a = new $c_sr_IntRef().init___I(0);
    const b = new $c_sr_IntRef().init___I(0);
    const n = new $c_sr_IntRef().init___I(0);
    const c = new $c_sr_IntRef().init___I(1);
    xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, a$1, b$1, n$1, c$1) {
      return (function(x$2) {
        const h = $m_sr_Statics$().anyHash__O__I(x$2);
        a$1.elem$1 = ((a$1.elem$1 + h) | 0);
        b$1.elem$1 = (b$1.elem$1 ^ h);
        if ((h !== 0)) {
          c$1.elem$1 = $imul(c$1.elem$1, h)
        };
        n$1.elem$1 = ((1 + n$1.elem$1) | 0)
      })
    })(this, a, b, n, c)));
    let h$1 = seed;
    h$1 = this.mix__I__I__I(h$1, a.elem$1);
    h$1 = this.mix__I__I__I(h$1, b.elem$1);
    h$1 = this.mixLast__I__I__I(h$1, c.elem$1);
    return this.finalizeHash__I__I__I(h$1, n.elem$1)
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
      const head = elems.head__O();
      const this$1 = elems;
      const tail = this$1.tail__sci_List();
      h = this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(head));
      n = ((1 + n) | 0);
      elems = tail
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
const $f_sc_TraversableOnce__to__scg_CanBuildFrom__O = (function($thiz, cbf) {
  const b = cbf.apply__scm_Builder();
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz.seq__sc_TraversableOnce());
  return b.result__O()
});
const $f_sc_TraversableOnce__mkString__T__T__T__T = (function($thiz, start, sep, end) {
  const this$1 = $thiz.addString__scm_StringBuilder__T__T__T__scm_StringBuilder(new $c_scm_StringBuilder().init___(), start, sep, end);
  return this$1.underlying$5.java$lang$StringBuilder$$content$f
});
const $f_sc_TraversableOnce__size__I = (function($thiz) {
  const result = new $c_sr_IntRef().init___I(0);
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, result$1) {
    return (function(x$2) {
      result$1.elem$1 = ((1 + result$1.elem$1) | 0)
    })
  })($thiz, result)));
  return result.elem$1
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
const $is_sc_TraversableOnce = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_TraversableOnce)))
});
const $isArrayOf_sc_TraversableOnce = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_TraversableOnce)))
});
class $c_scg_GenMapFactory extends $c_O {
}
class $c_scg_GenericCompanion extends $c_O {
  apply__sc_Seq__sc_GenTraversable(elems) {
    if (elems.isEmpty__Z()) {
      return this.empty__sc_GenTraversable()
    } else {
      const b = this.newBuilder__scm_Builder();
      b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(elems);
      return b.result__O()
    }
  };
  empty__sc_GenTraversable() {
    return this.newBuilder__scm_Builder().result__O()
  };
}
const $f_scg_Growable__loop$1__pscg_Growable__sc_LinearSeq__V = (function($thiz, xs) {
  _loop: while (true) {
    const this$1 = xs;
    if ($f_sc_TraversableOnce__nonEmpty__Z(this$1)) {
      $thiz.$$plus$eq__O__scg_Growable(xs.head__O());
      xs = xs.tail__O();
      continue _loop
    };
    break
  }
});
const $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function($thiz, xs) {
  if ($is_sc_LinearSeq(xs)) {
    const x2 = xs;
    let xs$1 = x2;
    $f_scg_Growable__loop$1__pscg_Growable__sc_LinearSeq__V($thiz, xs$1)
  } else {
    xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
      return (function(elem$2) {
        return $this.$$plus$eq__O__scg_Growable(elem$2)
      })
    })($thiz)))
  };
  return $thiz
});
class $c_sci_HashMap$Merger extends $c_O {
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
class $c_sci_StreamIterator$LazyCell extends $c_O {
  constructor() {
    super();
    this.v$1 = null;
    this.st$1 = null;
    this.bitmap$0$1 = false;
    this.$$outer$1 = null
  };
  init___sci_StreamIterator__F0($$outer, st) {
    this.st$1 = st;
    if (($$outer === null)) {
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
    } else {
      this.$$outer$1 = $$outer
    };
    return this
  };
  v$lzycompute__p1__sci_Stream() {
    if ((!this.bitmap$0$1)) {
      this.v$1 = this.st$1.apply__O();
      this.bitmap$0$1 = true
    };
    this.st$1 = null;
    return this.v$1
  };
  v__sci_Stream() {
    return ((!this.bitmap$0$1) ? this.v$lzycompute__p1__sci_Stream() : this.v$1)
  };
}
const $d_sci_StreamIterator$LazyCell = new $TypeData().initClass({
  sci_StreamIterator$LazyCell: 0
}, false, "scala.collection.immutable.StreamIterator$LazyCell", {
  sci_StreamIterator$LazyCell: 1,
  O: 1
});
$c_sci_StreamIterator$LazyCell.prototype.$classData = $d_sci_StreamIterator$LazyCell;
class $c_sci_StringOps$ extends $c_O {
  init___() {
    return this
  };
  equals$extension__T__O__Z($$this, x$1) {
    if ($is_sci_StringOps(x$1)) {
      const StringOps$1 = ((x$1 === null) ? null : x$1.repr$1);
      return ($$this === StringOps$1)
    } else {
      return false
    }
  };
}
const $d_sci_StringOps$ = new $TypeData().initClass({
  sci_StringOps$: 0
}, false, "scala.collection.immutable.StringOps$", {
  sci_StringOps$: 1,
  O: 1
});
$c_sci_StringOps$.prototype.$classData = $d_sci_StringOps$;
let $n_sci_StringOps$ = (void 0);
const $m_sci_StringOps$ = (function() {
  if ((!$n_sci_StringOps$)) {
    $n_sci_StringOps$ = new $c_sci_StringOps$().init___()
  };
  return $n_sci_StringOps$
});
class $c_sci_WrappedString$ extends $c_O {
  init___() {
    return this
  };
  newBuilder__scm_Builder() {
    const this$2 = new $c_scm_StringBuilder().init___();
    const f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
      return (function(x$2) {
        const x = x$2;
        return new $c_sci_WrappedString().init___T(x)
      })
    })(this));
    return new $c_scm_Builder$$anon$1().init___scm_Builder__F1(this$2, f)
  };
}
const $d_sci_WrappedString$ = new $TypeData().initClass({
  sci_WrappedString$: 0
}, false, "scala.collection.immutable.WrappedString$", {
  sci_WrappedString$: 1,
  O: 1
});
$c_sci_WrappedString$.prototype.$classData = $d_sci_WrappedString$;
let $n_sci_WrappedString$ = (void 0);
const $m_sci_WrappedString$ = (function() {
  if ((!$n_sci_WrappedString$)) {
    $n_sci_WrappedString$ = new $c_sci_WrappedString$().init___()
  };
  return $n_sci_WrappedString$
});
class $c_sjs_concurrent_JSExecutionContext$ extends $c_O {
  constructor() {
    super();
    this.runNow$1 = null;
    this.queue$1 = null
  };
  init___() {
    $n_sjs_concurrent_JSExecutionContext$ = this;
    this.runNow$1 = $m_sjs_concurrent_RunNowExecutionContext$();
    this.queue$1 = $m_sjs_concurrent_QueueExecutionContext$().apply__s_concurrent_ExecutionContextExecutor();
    return this
  };
}
const $d_sjs_concurrent_JSExecutionContext$ = new $TypeData().initClass({
  sjs_concurrent_JSExecutionContext$: 0
}, false, "scala.scalajs.concurrent.JSExecutionContext$", {
  sjs_concurrent_JSExecutionContext$: 1,
  O: 1
});
$c_sjs_concurrent_JSExecutionContext$.prototype.$classData = $d_sjs_concurrent_JSExecutionContext$;
let $n_sjs_concurrent_JSExecutionContext$ = (void 0);
const $m_sjs_concurrent_JSExecutionContext$ = (function() {
  if ((!$n_sjs_concurrent_JSExecutionContext$)) {
    $n_sjs_concurrent_JSExecutionContext$ = new $c_sjs_concurrent_JSExecutionContext$().init___()
  };
  return $n_sjs_concurrent_JSExecutionContext$
});
class $c_sjs_concurrent_QueueExecutionContext$ extends $c_O {
  init___() {
    return this
  };
  apply__s_concurrent_ExecutionContextExecutor() {
    const v = $g.Promise;
    if ((v === (void 0))) {
      return new $c_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext().init___()
    } else {
      return new $c_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext().init___()
    }
  };
}
const $d_sjs_concurrent_QueueExecutionContext$ = new $TypeData().initClass({
  sjs_concurrent_QueueExecutionContext$: 0
}, false, "scala.scalajs.concurrent.QueueExecutionContext$", {
  sjs_concurrent_QueueExecutionContext$: 1,
  O: 1
});
$c_sjs_concurrent_QueueExecutionContext$.prototype.$classData = $d_sjs_concurrent_QueueExecutionContext$;
let $n_sjs_concurrent_QueueExecutionContext$ = (void 0);
const $m_sjs_concurrent_QueueExecutionContext$ = (function() {
  if ((!$n_sjs_concurrent_QueueExecutionContext$)) {
    $n_sjs_concurrent_QueueExecutionContext$ = new $c_sjs_concurrent_QueueExecutionContext$().init___()
  };
  return $n_sjs_concurrent_QueueExecutionContext$
});
class $c_sjs_js_JSConverters$JSRichFuture$ extends $c_O {
  init___() {
    return this
  };
  scala$scalajs$js$JSConverters$JSRichFuture$$$anonfun$toJSPromise$1__sjs_js_Function1__sjs_js_Function1__s_concurrent_ExecutionContext__s_concurrent_Future__V(resolve, reject, executor$1, $$this$1) {
    $$this$1.onComplete__F1__s_concurrent_ExecutionContext__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, resolve$1, reject$1) {
      return (function(x0$2$2) {
        const x0$2 = x0$2$2;
        if ($is_s_util_Success(x0$2)) {
          const x2 = x0$2;
          const value = x2.value$2;
          return resolve$1(value)
        } else if ($is_s_util_Failure(x0$2)) {
          const x3 = x0$2;
          const th = x3.exception$2;
          let jsx$1;
          if ($is_sjs_js_JavaScriptException(th)) {
            const x2$2 = th;
            const e = x2$2.exception$4;
            jsx$1 = e
          } else {
            jsx$1 = th
          };
          return reject$1(jsx$1)
        } else {
          throw new $c_s_MatchError().init___O(x0$2)
        }
      })
    })(this, resolve, reject)), executor$1)
  };
  toJSPromise$extension__s_concurrent_Future__s_concurrent_ExecutionContext__sjs_js_Promise($$this, executor) {
    return new $g.Promise((function(executor$1, $$this$1) {
      return (function(arg1$2, arg2$2) {
        $m_sjs_js_JSConverters$JSRichFuture$().scala$scalajs$js$JSConverters$JSRichFuture$$$anonfun$toJSPromise$1__sjs_js_Function1__sjs_js_Function1__s_concurrent_ExecutionContext__s_concurrent_Future__V(arg1$2, arg2$2, executor$1, $$this$1)
      })
    })(executor, $$this))
  };
}
const $d_sjs_js_JSConverters$JSRichFuture$ = new $TypeData().initClass({
  sjs_js_JSConverters$JSRichFuture$: 0
}, false, "scala.scalajs.js.JSConverters$JSRichFuture$", {
  sjs_js_JSConverters$JSRichFuture$: 1,
  O: 1
});
$c_sjs_js_JSConverters$JSRichFuture$.prototype.$classData = $d_sjs_js_JSConverters$JSRichFuture$;
let $n_sjs_js_JSConverters$JSRichFuture$ = (void 0);
const $m_sjs_js_JSConverters$JSRichFuture$ = (function() {
  if ((!$n_sjs_js_JSConverters$JSRichFuture$)) {
    $n_sjs_js_JSConverters$JSRichFuture$ = new $c_sjs_js_JSConverters$JSRichFuture$().init___()
  };
  return $n_sjs_js_JSConverters$JSRichFuture$
});
class $c_sjs_js_WrappedDictionary$Cache$ extends $c_O {
  constructor() {
    super();
    this.safeHasOwnProperty$1 = null
  };
  init___() {
    $n_sjs_js_WrappedDictionary$Cache$ = this;
    this.safeHasOwnProperty$1 = $g.Object.prototype.hasOwnProperty;
    return this
  };
}
const $d_sjs_js_WrappedDictionary$Cache$ = new $TypeData().initClass({
  sjs_js_WrappedDictionary$Cache$: 0
}, false, "scala.scalajs.js.WrappedDictionary$Cache$", {
  sjs_js_WrappedDictionary$Cache$: 1,
  O: 1
});
$c_sjs_js_WrappedDictionary$Cache$.prototype.$classData = $d_sjs_js_WrappedDictionary$Cache$;
let $n_sjs_js_WrappedDictionary$Cache$ = (void 0);
const $m_sjs_js_WrappedDictionary$Cache$ = (function() {
  if ((!$n_sjs_js_WrappedDictionary$Cache$)) {
    $n_sjs_js_WrappedDictionary$Cache$ = new $c_sjs_js_WrappedDictionary$Cache$().init___()
  };
  return $n_sjs_js_WrappedDictionary$Cache$
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
class $c_sjsr_StackTrace$ extends $c_O {
  constructor() {
    super();
    this.isRhino$1 = false;
    this.decompressedClasses$1 = null;
    this.decompressedPrefixes$1 = null;
    this.compressedPrefixes$1 = null;
    this.bitmap$0$1 = 0
  };
  compressedPrefixes$lzycompute__p1__sjs_js_Array() {
    if (((8 & this.bitmap$0$1) === 0)) {
      this.compressedPrefixes$1 = $g.Object.keys(this.decompressedPrefixes__p1__sjs_js_Dictionary());
      this.bitmap$0$1 = (8 | this.bitmap$0$1)
    };
    return this.compressedPrefixes$1
  };
  extractFirefox__p1__sjs_js_Dynamic__sjs_js_Array(e) {
    const x = e.stack;
    const x$1 = x.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("(?:\\n@:0)?\\s+$", "m"), "");
    const x$2 = x$1.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^(?:\\((\\S*)\\))?@", "gm"), "{anonymous}($1)@");
    return x$2.split("\n")
  };
  extractOpera10a__p1__sjs_js_Dynamic__sjs_js_Array(e) {
    const lineRE = $m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("Line (\\d+).*script (?:in )?(\\S+)(?:: In function (\\S+))?$", "i");
    const x = e.stacktrace;
    const lines = x.split("\n");
    const result = [];
    let i = 0;
    const len = (lines.length | 0);
    while ((i < len)) {
      const mtch = lineRE.exec(lines[i]);
      if ((mtch !== null)) {
        const value = mtch[3];
        const fnName = ((value === (void 0)) ? "{anonymous}" : value);
        const value$1 = mtch[2];
        if ((value$1 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        const value$2 = mtch[1];
        if ((value$2 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        const jsx$1 = result.push(((((fnName + "()@") + value$1) + ":") + value$2))
      };
      i = ((2 + i) | 0)
    };
    return result
  };
  init___() {
    return this
  };
  isRhino__p1__Z() {
    return (((1 & this.bitmap$0$1) === 0) ? this.isRhino$lzycompute__p1__Z() : this.isRhino$1)
  };
  decodeClassName__p1__T__T(encodedName) {
    const encoded = (((65535 & (encodedName.charCodeAt(0) | 0)) === 36) ? encodedName.substring(1) : encodedName);
    const dict = this.decompressedClasses__p1__sjs_js_Dictionary();
    let base;
    if ((!(!$m_sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1.call(dict, encoded)))) {
      const dict$1 = this.decompressedClasses__p1__sjs_js_Dictionary();
      if ((!(!(!$m_sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1.call(dict$1, encoded))))) {
        throw new $c_ju_NoSuchElementException().init___T(("key not found: " + encoded))
      };
      base = dict$1[encoded]
    } else {
      base = this.loop$1__p1__I__T__T(0, encoded)
    };
    const thiz = base.split("_").join(".");
    return thiz.split("$und").join("_")
  };
  extractOpera10b__p1__sjs_js_Dynamic__sjs_js_Array(e) {
    const lineRE = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^(.*)@(.+):(\\d+)$");
    const x = e.stacktrace;
    const lines = x.split("\n");
    const result = [];
    let i = 0;
    const len = (lines.length | 0);
    while ((i < len)) {
      const mtch = lineRE.exec(lines[i]);
      if ((mtch !== null)) {
        const value = mtch[1];
        let fnName;
        if ((value === (void 0))) {
          fnName = "global code"
        } else {
          const x$3 = value;
          fnName = (x$3 + "()")
        };
        const value$1 = mtch[2];
        if ((value$1 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        const value$2 = mtch[3];
        if ((value$2 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        const jsx$1 = result.push(((((fnName + "@") + value$1) + ":") + value$2))
      };
      i = ((1 + i) | 0)
    };
    return result
  };
  extractChrome__p1__sjs_js_Dynamic__sjs_js_Array(e) {
    const x = (e.stack + "\n");
    const x$1 = x.replace($m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^[\\s\\S]+?\\s+at\\s+"), " at ");
    const x$2 = x$1.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^\\s+(at eval )?at\\s+", "gm"), "");
    const x$3 = x$2.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^([^\\(]+?)([\\n])", "gm"), "{anonymous}() ($1)$2");
    const x$4 = x$3.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^Object.<anonymous>\\s*\\(([^\\)]+)\\)", "gm"), "{anonymous}() ($1)");
    const x$5 = x$4.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^([^\\(]+|\\{anonymous\\}\\(\\)) \\((.+)\\)$", "gm"), "$1@$2");
    const jsx$1 = x$5.split("\n");
    return jsx$1.slice(0, (-1))
  };
  extract__sjs_js_Dynamic__Ajl_StackTraceElement(stackdata) {
    const lines = this.normalizeStackTraceLines__p1__sjs_js_Dynamic__sjs_js_Array(stackdata);
    return this.normalizedLinesToStackTrace__p1__sjs_js_Array__Ajl_StackTraceElement(lines)
  };
  compressedPrefixes__p1__sjs_js_Array() {
    return (((8 & this.bitmap$0$1) === 0) ? this.compressedPrefixes$lzycompute__p1__sjs_js_Array() : this.compressedPrefixes$1)
  };
  decompressedClasses__p1__sjs_js_Dictionary() {
    return (((2 & this.bitmap$0$1) === 0) ? this.decompressedClasses$lzycompute__p1__sjs_js_Dictionary() : this.decompressedClasses$1)
  };
  extractClassMethod__p1__T__T2(functionName) {
    const PatC = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^(?:Object\\.|\\[object Object\\]\\.)?(?:ScalaJS\\.c\\.|\\$c_)([^\\.]+)(?:\\.prototype)?\\.([^\\.]+)$");
    const PatS = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^(?:Object\\.|\\[object Object\\]\\.)?(?:ScalaJS\\.(?:s|f)\\.|\\$(?:s|f)_)((?:_[^_]|[^_])+)__([^\\.]+)$");
    const PatM = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^(?:Object\\.|\\[object Object\\]\\.)?(?:ScalaJS\\.m\\.|\\$m_)([^\\.]+)$");
    let isModule = false;
    let mtch = PatC.exec(functionName);
    if ((mtch === null)) {
      mtch = PatS.exec(functionName);
      if ((mtch === null)) {
        mtch = PatM.exec(functionName);
        isModule = true
      }
    };
    if ((mtch !== null)) {
      const value = mtch[1];
      if ((value === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      const className = this.decodeClassName__p1__T__T(value);
      let methodName;
      if (isModule) {
        methodName = "<clinit>"
      } else {
        const value$1 = mtch[2];
        if ((value$1 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        methodName = this.decodeMethodName__p1__T__T(value$1)
      };
      return new $c_T2().init___O__O(className, methodName)
    } else {
      return new $c_T2().init___O__O("<jscode>", functionName)
    }
  };
  isRhino$lzycompute__p1__Z() {
    if (((1 & this.bitmap$0$1) === 0)) {
      this.isRhino$1 = this.liftedTree1$1__p1__Z();
      this.bitmap$0$1 = (1 | this.bitmap$0$1)
    };
    return this.isRhino$1
  };
  decompressedPrefixes$lzycompute__p1__sjs_js_Dictionary() {
    if (((4 & this.bitmap$0$1) === 0)) {
      this.decompressedPrefixes$1 = {
        "sjsr_": "scala_scalajs_runtime_",
        "sjs_": "scala_scalajs_",
        "sci_": "scala_collection_immutable_",
        "scm_": "scala_collection_mutable_",
        "scg_": "scala_collection_generic_",
        "sc_": "scala_collection_",
        "sr_": "scala_runtime_",
        "s_": "scala_",
        "jl_": "java_lang_",
        "ju_": "java_util_"
      };
      this.bitmap$0$1 = (4 | this.bitmap$0$1)
    };
    return this.decompressedPrefixes$1
  };
  extract__jl_Throwable__Ajl_StackTraceElement(throwable) {
    return this.extract__sjs_js_Dynamic__Ajl_StackTraceElement(throwable.stackdata)
  };
  decompressedClasses$lzycompute__p1__sjs_js_Dictionary() {
    if (((2 & this.bitmap$0$1) === 0)) {
      const dict = {
        "O": "java_lang_Object",
        "T": "java_lang_String",
        "V": "scala_Unit",
        "Z": "scala_Boolean",
        "C": "scala_Char",
        "B": "scala_Byte",
        "S": "scala_Short",
        "I": "scala_Int",
        "J": "scala_Long",
        "F": "scala_Float",
        "D": "scala_Double"
      };
      let index = 0;
      while ((index <= 22)) {
        if ((index >= 2)) {
          dict[("T" + index)] = ("scala_Tuple" + index)
        };
        dict[("F" + index)] = ("scala_Function" + index);
        index = ((1 + index) | 0)
      };
      this.decompressedClasses$1 = dict;
      this.bitmap$0$1 = (2 | this.bitmap$0$1)
    };
    return this.decompressedClasses$1
  };
  normalizeStackTraceLines__p1__sjs_js_Dynamic__sjs_js_Array(e) {
    const x = (!e);
    if ((!(!(!(!x))))) {
      return []
    } else if (this.isRhino__p1__Z()) {
      return this.extractRhino__p1__sjs_js_Dynamic__sjs_js_Array(e)
    } else {
      const x$1 = (e.arguments && e.stack);
      if ((!(!(!(!x$1))))) {
        return this.extractChrome__p1__sjs_js_Dynamic__sjs_js_Array(e)
      } else {
        const x$2 = (e.stack && e.sourceURL);
        if ((!(!(!(!x$2))))) {
          return this.extractSafari__p1__sjs_js_Dynamic__sjs_js_Array(e)
        } else {
          const x$3 = (e.stack && e.number);
          if ((!(!(!(!x$3))))) {
            return this.extractIE__p1__sjs_js_Dynamic__sjs_js_Array(e)
          } else {
            const x$4 = (e.stack && e.fileName);
            if ((!(!(!(!x$4))))) {
              return this.extractFirefox__p1__sjs_js_Dynamic__sjs_js_Array(e)
            } else {
              const x$5 = (e.message && e["opera#sourceloc"]);
              if ((!(!(!(!x$5))))) {
                const x$6 = (!e.stacktrace);
                if ((!(!(!(!x$6))))) {
                  return this.extractOpera9__p1__sjs_js_Dynamic__sjs_js_Array(e)
                } else {
                  const x$7 = ((e.message.indexOf("\n") > (-1)) && (e.message.split("\n").length > e.stacktrace.split("\n").length));
                  if ((!(!(!(!x$7))))) {
                    return this.extractOpera9__p1__sjs_js_Dynamic__sjs_js_Array(e)
                  } else {
                    return this.extractOpera10a__p1__sjs_js_Dynamic__sjs_js_Array(e)
                  }
                }
              } else {
                const x$8 = ((e.message && e.stack) && e.stacktrace);
                if ((!(!(!(!x$8))))) {
                  const x$9 = (e.stacktrace.indexOf("called from line") < 0);
                  if ((!(!(!(!x$9))))) {
                    return this.extractOpera10b__p1__sjs_js_Dynamic__sjs_js_Array(e)
                  } else {
                    return this.extractOpera11__p1__sjs_js_Dynamic__sjs_js_Array(e)
                  }
                } else {
                  const x$10 = (e.stack && (!e.fileName));
                  if ((!(!(!(!x$10))))) {
                    return this.extractChrome__p1__sjs_js_Dynamic__sjs_js_Array(e)
                  } else {
                    return this.extractOther__p1__sjs_js_Dynamic__sjs_js_Array(e)
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  extractOpera9__p1__sjs_js_Dynamic__sjs_js_Array(e) {
    const lineRE = $m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("Line (\\d+).*script (?:in )?(\\S+)", "i");
    const x = e.message;
    const lines = x.split("\n");
    const result = [];
    let i = 2;
    const len = (lines.length | 0);
    while ((i < len)) {
      const mtch = lineRE.exec(lines[i]);
      if ((mtch !== null)) {
        const value = mtch[2];
        if ((value === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        const value$1 = mtch[1];
        if ((value$1 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        const jsx$1 = result.push(((("{anonymous}()@" + value) + ":") + value$1))
      };
      i = ((2 + i) | 0)
    };
    return result
  };
  normalizedLinesToStackTrace__p1__sjs_js_Array__Ajl_StackTraceElement(lines) {
    const NormalizedFrameLine = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^([^\\@]*)\\@(.*):([0-9]+)$");
    const NormalizedFrameLineWithColumn = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^([^\\@]*)\\@(.*):([0-9]+):([0-9]+)$");
    const trace = [];
    let i = 0;
    while ((i < (lines.length | 0))) {
      const line = lines[i];
      if ((line === null)) {
        throw new $c_jl_NullPointerException().init___()
      };
      if ((line !== "")) {
        const mtch1 = NormalizedFrameLineWithColumn.exec(line);
        if ((mtch1 !== null)) {
          const value = mtch1[1];
          if ((value === (void 0))) {
            throw new $c_ju_NoSuchElementException().init___T("undefined.get")
          };
          const x1 = this.extractClassMethod__p1__T__T2(value);
          if ((x1 === null)) {
            throw new $c_s_MatchError().init___O(x1)
          };
          const className = x1.$$und1$f;
          const methodName = x1.$$und2$f;
          const value$1 = mtch1[2];
          if ((value$1 === (void 0))) {
            throw new $c_ju_NoSuchElementException().init___T("undefined.get")
          };
          const fileName = value$1;
          const value$2 = mtch1[3];
          if ((value$2 === (void 0))) {
            throw new $c_ju_NoSuchElementException().init___T("undefined.get")
          };
          const x = value$2;
          const this$15 = new $c_sci_StringOps().init___T(x);
          const this$17 = $m_jl_Integer$();
          const $$this = this$15.repr$1;
          const lineNumber = this$17.parseInt__T__I__I($$this, 10);
          const value$3 = mtch1[4];
          if ((value$3 === (void 0))) {
            throw new $c_ju_NoSuchElementException().init___T("undefined.get")
          };
          const x$1 = value$3;
          const this$23 = new $c_sci_StringOps().init___T(x$1);
          const this$25 = $m_jl_Integer$();
          const $$this$1 = this$23.repr$1;
          const value$4 = this$25.parseInt__T__I__I($$this$1, 10);
          const jsx$1 = trace.push({
            "declaringClass": className,
            "methodName": methodName,
            "fileName": fileName,
            "lineNumber": lineNumber,
            "columnNumber": ((value$4 === (void 0)) ? (void 0) : value$4)
          })
        } else {
          const mtch2 = NormalizedFrameLine.exec(line);
          if ((mtch2 !== null)) {
            const value$5 = mtch2[1];
            if ((value$5 === (void 0))) {
              throw new $c_ju_NoSuchElementException().init___T("undefined.get")
            };
            const x1$2 = this.extractClassMethod__p1__T__T2(value$5);
            if ((x1$2 === null)) {
              throw new $c_s_MatchError().init___O(x1$2)
            };
            const className$3 = x1$2.$$und1$f;
            const methodName$3 = x1$2.$$und2$f;
            const value$6 = mtch2[2];
            if ((value$6 === (void 0))) {
              throw new $c_ju_NoSuchElementException().init___T("undefined.get")
            };
            const fileName$1 = value$6;
            const value$7 = mtch2[3];
            if ((value$7 === (void 0))) {
              throw new $c_ju_NoSuchElementException().init___T("undefined.get")
            };
            const x$2 = value$7;
            const this$52 = new $c_sci_StringOps().init___T(x$2);
            const this$54 = $m_jl_Integer$();
            const $$this$2 = this$52.repr$1;
            const lineNumber$1 = this$54.parseInt__T__I__I($$this$2, 10);
            const jsx$2 = trace.push({
              "declaringClass": className$3,
              "methodName": methodName$3,
              "fileName": fileName$1,
              "lineNumber": lineNumber$1,
              "columnNumber": (void 0)
            })
          } else {
            (trace.push({
              "declaringClass": "<jscode>",
              "methodName": line,
              "fileName": null,
              "lineNumber": (-1),
              "columnNumber": (void 0)
            }) | 0)
          }
        }
      };
      i = ((1 + i) | 0)
    };
    const value$8 = $env.sourceMapper;
    const mappedTrace = ((value$8 === (void 0)) ? trace : value$8(trace));
    const result = $newArrayObject($d_jl_StackTraceElement.getArrayOf(), [(mappedTrace.length | 0)]);
    i = 0;
    while ((i < (mappedTrace.length | 0))) {
      const jsSte = mappedTrace[i];
      const ste = new $c_jl_StackTraceElement().init___T__T__T__I(jsSte.declaringClass, jsSte.methodName, jsSte.fileName, (jsSte.lineNumber | 0));
      const value$9 = jsSte.columnNumber;
      if ((value$9 !== (void 0))) {
        const columnNumber = (value$9 | 0);
        ste.setColumnNumber(columnNumber)
      };
      result.u[i] = ste;
      i = ((1 + i) | 0)
    };
    return result
  };
  extractOpera11__p1__sjs_js_Dynamic__sjs_js_Array(e) {
    const lineRE = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^.*line (\\d+), column (\\d+)(?: in (.+))? in (\\S+):$");
    const x = e.stacktrace;
    const lines = x.split("\n");
    const result = [];
    let i = 0;
    const len = (lines.length | 0);
    while ((i < len)) {
      const mtch = lineRE.exec(lines[i]);
      if ((mtch !== null)) {
        const value = mtch[4];
        if ((value === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        const value$1 = mtch[1];
        if ((value$1 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        const value$2 = mtch[2];
        if ((value$2 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        const location = ((((value + ":") + value$1) + ":") + value$2);
        const value$3 = mtch[2];
        const fnName0 = ((value$3 === (void 0)) ? "global code" : value$3);
        const x$1 = fnName0.replace($m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("<anonymous function: (\\S+)>"), "$1");
        const fnName = x$1.replace($m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("<anonymous function>"), "{anonymous}");
        (result.push(((fnName + "@") + location)) | 0)
      };
      i = ((2 + i) | 0)
    };
    return result
  };
  extractSafari__p1__sjs_js_Dynamic__sjs_js_Array(e) {
    const x = e.stack;
    const x$1 = x.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("\\[native code\\]\\n", "m"), "");
    const x$2 = x$1.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^(?=\\w+Error\\:).*$\\n", "m"), "");
    const x$3 = x$2.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^@", "gm"), "{anonymous}()@");
    return x$3.split("\n")
  };
  loop$1__p1__I__T__T(i, encoded$1) {
    _loop: while (true) {
      if ((i < (this.compressedPrefixes__p1__sjs_js_Array().length | 0))) {
        const prefix = this.compressedPrefixes__p1__sjs_js_Array()[i];
        if ((((encoded$1.length | 0) >= 0) && (encoded$1.substring(0, (prefix.length | 0)) === prefix))) {
          const dict = this.decompressedPrefixes__p1__sjs_js_Dictionary();
          if ((!(!(!$m_sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1.call(dict, prefix))))) {
            throw new $c_ju_NoSuchElementException().init___T(("key not found: " + prefix))
          };
          const jsx$1 = dict[prefix];
          const beginIndex = (prefix.length | 0);
          return (("" + jsx$1) + encoded$1.substring(beginIndex))
        } else {
          i = ((1 + i) | 0);
          continue _loop
        }
      } else {
        return ((((encoded$1.length | 0) >= 0) && (encoded$1.substring(0, ("L".length | 0)) === "L")) ? encoded$1.substring(1) : encoded$1)
      }
    }
  };
  liftedTree1$1__p1__Z() {
    try {
      $g.Packages.org.mozilla.javascript.JavaScriptException;
      return true
    } catch (e) {
      const e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        if ($is_sjs_js_JavaScriptException(e$2)) {
          return false
        } else {
          throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
        }
      } else {
        throw e
      }
    }
  };
  decompressedPrefixes__p1__sjs_js_Dictionary() {
    return (((4 & this.bitmap$0$1) === 0) ? this.decompressedPrefixes$lzycompute__p1__sjs_js_Dictionary() : this.decompressedPrefixes$1)
  };
  extractRhino__p1__sjs_js_Dynamic__sjs_js_Array(e) {
    const value = e.stack;
    const x = ((value === (void 0)) ? "" : value);
    const x$1 = x.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^\\s+at\\s+", "gm"), "");
    const x$2 = x$1.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^(.+?)(?: \\((.+)\\))?$", "gm"), "$2@$1");
    const x$3 = x$2.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("\\r\\n?", "gm"), "\n");
    return x$3.split("\n")
  };
  extractOther__p1__sjs_js_Dynamic__sjs_js_Array(e) {
    return []
  };
  extractIE__p1__sjs_js_Dynamic__sjs_js_Array(e) {
    const x = e.stack;
    const x$1 = x.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^\\s*at\\s+(.*)$", "gm"), "$1");
    const x$2 = x$1.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^Anonymous function\\s+", "gm"), "{anonymous}() ");
    const x$3 = x$2.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^([^\\(]+|\\{anonymous\\}\\(\\))\\s+\\((.+)\\)$", "gm"), "$1@$2");
    const qual$1 = x$3.split("\n");
    return qual$1.slice(1)
  };
  decodeMethodName__p1__T__T(encodedName) {
    if ((((encodedName.length | 0) >= 0) && (encodedName.substring(0, ("init___".length | 0)) === "init___"))) {
      return "<init>"
    } else {
      const methodNameLen = (encodedName.indexOf("__") | 0);
      return ((methodNameLen < 0) ? encodedName : encodedName.substring(0, methodNameLen))
    }
  };
}
const $d_sjsr_StackTrace$ = new $TypeData().initClass({
  sjsr_StackTrace$: 0
}, false, "scala.scalajs.runtime.StackTrace$", {
  sjsr_StackTrace$: 1,
  O: 1
});
$c_sjsr_StackTrace$.prototype.$classData = $d_sjsr_StackTrace$;
let $n_sjsr_StackTrace$ = (void 0);
const $m_sjsr_StackTrace$ = (function() {
  if ((!$n_sjsr_StackTrace$)) {
    $n_sjsr_StackTrace$ = new $c_sjsr_StackTrace$().init___()
  };
  return $n_sjsr_StackTrace$
});
class $c_sjsr_StackTrace$StringRE$ extends $c_O {
  init___() {
    return this
  };
  re$extension1__T__T__sjs_js_RegExp($$this, mods) {
    return new $g.RegExp($$this, mods)
  };
  re$extension0__T__sjs_js_RegExp($$this) {
    return new $g.RegExp($$this)
  };
}
const $d_sjsr_StackTrace$StringRE$ = new $TypeData().initClass({
  sjsr_StackTrace$StringRE$: 0
}, false, "scala.scalajs.runtime.StackTrace$StringRE$", {
  sjsr_StackTrace$StringRE$: 1,
  O: 1
});
$c_sjsr_StackTrace$StringRE$.prototype.$classData = $d_sjsr_StackTrace$StringRE$;
let $n_sjsr_StackTrace$StringRE$ = (void 0);
const $m_sjsr_StackTrace$StringRE$ = (function() {
  if ((!$n_sjsr_StackTrace$StringRE$)) {
    $n_sjsr_StackTrace$StringRE$ = new $c_sjsr_StackTrace$StringRE$().init___()
  };
  return $n_sjsr_StackTrace$StringRE$
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
class $c_sr_BoxesRunTime$ extends $c_O {
  init___() {
    return this
  };
  equalsCharObject__jl_Character__O__Z(xc, y) {
    if ($is_jl_Character(y)) {
      const x2 = y;
      return (xc.value$1 === x2.value$1)
    } else if ($is_jl_Number(y)) {
      const x3 = y;
      if (((typeof x3) === "number")) {
        const x2$1 = (+x3);
        return (x2$1 === xc.value$1)
      } else if ($is_sjsr_RuntimeLong(x3)) {
        const t = $uJ(x3);
        const lo = t.lo$2;
        const hi = t.hi$2;
        const value = xc.value$1;
        const hi$1 = (value >> 31);
        return ((lo === value) && (hi === hi$1))
      } else {
        return ((x3 === null) ? (xc === null) : $objectEquals(x3, xc))
      }
    } else {
      return ((xc === null) && (y === null))
    }
  };
  equalsNumObject__jl_Number__O__Z(xn, y) {
    if ($is_jl_Number(y)) {
      const x2 = y;
      return this.equalsNumNum__jl_Number__jl_Number__Z(xn, x2)
    } else if ($is_jl_Character(y)) {
      const x3 = y;
      if (((typeof xn) === "number")) {
        const x2$1 = (+xn);
        return (x2$1 === x3.value$1)
      } else if ($is_sjsr_RuntimeLong(xn)) {
        const t = $uJ(xn);
        const lo = t.lo$2;
        const hi = t.hi$2;
        const value = x3.value$1;
        const hi$1 = (value >> 31);
        return ((lo === value) && (hi === hi$1))
      } else {
        return ((xn === null) ? (x3 === null) : $objectEquals(xn, x3))
      }
    } else {
      return ((xn === null) ? (y === null) : $objectEquals(xn, y))
    }
  };
  equals__O__O__Z(x, y) {
    if ((x === y)) {
      return true
    } else if ($is_jl_Number(x)) {
      const x2 = x;
      return this.equalsNumObject__jl_Number__O__Z(x2, y)
    } else if ($is_jl_Character(x)) {
      const x3 = x;
      return this.equalsCharObject__jl_Character__O__Z(x3, y)
    } else {
      return ((x === null) ? (y === null) : $objectEquals(x, y))
    }
  };
  equalsNumNum__jl_Number__jl_Number__Z(xn, yn) {
    if (((typeof xn) === "number")) {
      const x2 = (+xn);
      if (((typeof yn) === "number")) {
        const x2$2 = (+yn);
        return (x2 === x2$2)
      } else if ($is_sjsr_RuntimeLong(yn)) {
        const t = $uJ(yn);
        const lo = t.lo$2;
        const hi = t.hi$2;
        return (x2 === $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo, hi))
      } else if ($is_s_math_ScalaNumber(yn)) {
        const x4 = yn;
        return x4.equals__O__Z(x2)
      } else {
        return false
      }
    } else if ($is_sjsr_RuntimeLong(xn)) {
      const t$1 = $uJ(xn);
      const lo$1 = t$1.lo$2;
      const hi$1 = t$1.hi$2;
      if ($is_sjsr_RuntimeLong(yn)) {
        const t$2 = $uJ(yn);
        const lo$2 = t$2.lo$2;
        const hi$2 = t$2.hi$2;
        return ((lo$1 === lo$2) && (hi$1 === hi$2))
      } else if (((typeof yn) === "number")) {
        const x3$3 = (+yn);
        return ($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo$1, hi$1) === x3$3)
      } else if ($is_s_math_ScalaNumber(yn)) {
        const x4$2 = yn;
        return x4$2.equals__O__Z(new $c_sjsr_RuntimeLong().init___I__I(lo$1, hi$1))
      } else {
        return false
      }
    } else {
      return ((xn === null) ? (yn === null) : $objectEquals(xn, yn))
    }
  };
}
const $d_sr_BoxesRunTime$ = new $TypeData().initClass({
  sr_BoxesRunTime$: 0
}, false, "scala.runtime.BoxesRunTime$", {
  sr_BoxesRunTime$: 1,
  O: 1
});
$c_sr_BoxesRunTime$.prototype.$classData = $d_sr_BoxesRunTime$;
let $n_sr_BoxesRunTime$ = (void 0);
const $m_sr_BoxesRunTime$ = (function() {
  if ((!$n_sr_BoxesRunTime$)) {
    $n_sr_BoxesRunTime$ = new $c_sr_BoxesRunTime$().init___()
  };
  return $n_sr_BoxesRunTime$
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
  array$undlength__O__I(xs) {
    if ($isArrayOf_O(xs, 1)) {
      const x2 = xs;
      return x2.u.length
    } else if ($isArrayOf_I(xs, 1)) {
      const x3 = xs;
      return x3.u.length
    } else if ($isArrayOf_D(xs, 1)) {
      const x4 = xs;
      return x4.u.length
    } else if ($isArrayOf_J(xs, 1)) {
      const x5 = xs;
      return x5.u.length
    } else if ($isArrayOf_F(xs, 1)) {
      const x6 = xs;
      return x6.u.length
    } else if ($isArrayOf_C(xs, 1)) {
      const x7 = xs;
      return x7.u.length
    } else if ($isArrayOf_B(xs, 1)) {
      const x8 = xs;
      return x8.u.length
    } else if ($isArrayOf_S(xs, 1)) {
      const x9 = xs;
      return x9.u.length
    } else if ($isArrayOf_Z(xs, 1)) {
      const x10 = xs;
      return x10.u.length
    } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
      const x11 = xs;
      return x11.u.length
    } else if ((xs === null)) {
      throw new $c_jl_NullPointerException().init___()
    } else {
      throw new $c_s_MatchError().init___O(xs)
    }
  };
  array$undupdate__O__I__O__V(xs, idx, value) {
    if ($isArrayOf_O(xs, 1)) {
      const x2 = xs;
      x2.u[idx] = value
    } else if ($isArrayOf_I(xs, 1)) {
      const x3 = xs;
      x3.u[idx] = (value | 0)
    } else if ($isArrayOf_D(xs, 1)) {
      const x4 = xs;
      x4.u[idx] = (+value)
    } else if ($isArrayOf_J(xs, 1)) {
      const x5 = xs;
      x5.u[idx] = $uJ(value)
    } else if ($isArrayOf_F(xs, 1)) {
      const x6 = xs;
      x6.u[idx] = (+value)
    } else if ($isArrayOf_C(xs, 1)) {
      const x7 = xs;
      let jsx$1;
      if ((value === null)) {
        jsx$1 = 0
      } else {
        const this$2 = value;
        jsx$1 = this$2.value$1
      };
      x7.u[idx] = jsx$1
    } else if ($isArrayOf_B(xs, 1)) {
      const x8 = xs;
      x8.u[idx] = (value | 0)
    } else if ($isArrayOf_S(xs, 1)) {
      const x9 = xs;
      x9.u[idx] = (value | 0)
    } else if ($isArrayOf_Z(xs, 1)) {
      const x10 = xs;
      x10.u[idx] = (!(!value))
    } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
      const x11 = xs;
      x11.u[idx] = (void 0)
    } else if ((xs === null)) {
      throw new $c_jl_NullPointerException().init___()
    } else {
      throw new $c_s_MatchError().init___O(xs)
    }
  };
  $$undtoString__s_Product__T(x) {
    const this$1 = x.productIterator__sc_Iterator();
    const start = (x.productPrefix__T() + "(");
    return $f_sc_TraversableOnce__mkString__T__T__T__T(this$1, start, ",", ")")
  };
  array$undapply__O__I__O(xs, idx) {
    if ($isArrayOf_O(xs, 1)) {
      const x2 = xs;
      return x2.u[idx]
    } else if ($isArrayOf_I(xs, 1)) {
      const x3 = xs;
      return x3.u[idx]
    } else if ($isArrayOf_D(xs, 1)) {
      const x4 = xs;
      return x4.u[idx]
    } else if ($isArrayOf_J(xs, 1)) {
      const x5 = xs;
      return x5.u[idx]
    } else if ($isArrayOf_F(xs, 1)) {
      const x6 = xs;
      return x6.u[idx]
    } else if ($isArrayOf_C(xs, 1)) {
      const x7 = xs;
      const c = x7.u[idx];
      return new $c_jl_Character().init___C(c)
    } else if ($isArrayOf_B(xs, 1)) {
      const x8 = xs;
      return x8.u[idx]
    } else if ($isArrayOf_S(xs, 1)) {
      const x9 = xs;
      return x9.u[idx]
    } else if ($isArrayOf_Z(xs, 1)) {
      const x10 = xs;
      return x10.u[idx]
    } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
      const x11 = xs;
      return x11.u[idx]
    } else if ((xs === null)) {
      throw new $c_jl_NullPointerException().init___()
    } else {
      throw new $c_s_MatchError().init___O(xs)
    }
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
const $is_jl_Number = (function(obj) {
  return (!(!(((obj && obj.$classData) && obj.$classData.ancestors.jl_Number) || ((typeof obj) === "number"))))
});
const $isArrayOf_jl_Number = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Number)))
});
class $c_jl_StackTraceElement extends $c_O {
  constructor() {
    super();
    this.declaringClass$1 = null;
    this.methodName$1 = null;
    this.fileName$1 = null;
    this.lineNumber$1 = 0;
    this.columnNumber$1 = 0
  };
  $$js$exported$meth$getColumnNumber__O() {
    return this.columnNumber$1
  };
  init___T__T__T__I(declaringClass, methodName, fileName, lineNumber) {
    this.declaringClass$1 = declaringClass;
    this.methodName$1 = methodName;
    this.fileName$1 = fileName;
    this.lineNumber$1 = lineNumber;
    this.columnNumber$1 = (-1);
    return this
  };
  equals__O__Z(that) {
    if ($is_jl_StackTraceElement(that)) {
      const x2 = that;
      return ((((this.fileName$1 === x2.fileName$1) && (this.lineNumber$1 === x2.lineNumber$1)) && (this.declaringClass$1 === x2.declaringClass$1)) && (this.methodName$1 === x2.methodName$1))
    } else {
      return false
    }
  };
  $$js$exported$meth$setColumnNumber__I__O(columnNumber) {
    this.columnNumber$1 = columnNumber
  };
  toString__T() {
    let result = "";
    if ((this.declaringClass$1 !== "<jscode>")) {
      result = ((("" + result) + this.declaringClass$1) + ".")
    };
    result = (("" + result) + this.methodName$1);
    if ((this.fileName$1 === null)) {
      result = (result + "(Unknown Source)")
    } else {
      result = (("" + result) + new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["(", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.fileName$1])));
      if ((this.lineNumber$1 >= 0)) {
        result = (("" + result) + new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array([":", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.lineNumber$1])));
        if ((this.columnNumber$1 >= 0)) {
          result = (("" + result) + new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array([":", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.columnNumber$1])))
        }
      };
      result = (result + ")")
    };
    return result
  };
  hashCode__I() {
    const this$1 = this.declaringClass$1;
    const jsx$1 = $m_sjsr_RuntimeString$().hashCode__T__I(this$1);
    const this$2 = this.methodName$1;
    return (jsx$1 ^ $m_sjsr_RuntimeString$().hashCode__T__I(this$2))
  };
  "setColumnNumber"(arg$1) {
    const prep0 = (arg$1 | 0);
    return this.$$js$exported$meth$setColumnNumber__I__O(prep0)
  };
  "getColumnNumber"() {
    return this.$$js$exported$meth$getColumnNumber__O()
  };
}
const $is_jl_StackTraceElement = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_StackTraceElement)))
});
const $isArrayOf_jl_StackTraceElement = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_StackTraceElement)))
});
const $d_jl_StackTraceElement = new $TypeData().initClass({
  jl_StackTraceElement: 0
}, false, "java.lang.StackTraceElement", {
  jl_StackTraceElement: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_StackTraceElement.prototype.$classData = $d_jl_StackTraceElement;
class $c_jl_Thread extends $c_O {
  constructor() {
    super();
    this.java$lang$Thread$$interruptedState$1 = false;
    this.name$1 = null
  };
  run__V() {
    /*<skip>*/
  };
  init___sr_BoxedUnit(dummy) {
    this.java$lang$Thread$$interruptedState$1 = false;
    this.name$1 = "main";
    return this
  };
}
const $d_jl_Thread = new $TypeData().initClass({
  jl_Thread: 0
}, false, "java.lang.Thread", {
  jl_Thread: 1,
  O: 1,
  jl_Runnable: 1
});
$c_jl_Thread.prototype.$classData = $d_jl_Thread;
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
  getStackTrace__Ajl_StackTraceElement() {
    if ((this.stackTrace$1 === null)) {
      this.stackTrace$1 = $m_sjsr_StackTrace$().extract__jl_Throwable__Ajl_StackTraceElement(this)
    };
    return this.stackTrace$1
  };
  init___T__jl_Throwable(s, e) {
    this.s$1 = s;
    this.e$1 = e;
    this.fillInStackTrace__jl_Throwable();
    return this
  };
  printStackTrace__Ljava_io_PrintStream__V(s) {
    const f = (function($this, s$1) {
      return (function(x$1$2) {
        const x$1 = x$1$2;
        s$1.println__T__V(x$1)
      })
    })(this, s);
    this.getStackTrace__Ajl_StackTraceElement();
    const arg1 = this.toString__T();
    f(arg1);
    if ((this.stackTrace$1.u.length !== 0)) {
      let i = 0;
      while ((i < this.stackTrace$1.u.length)) {
        const arg1$1 = ("  at " + this.stackTrace$1.u[i]);
        f(arg1$1);
        i = ((1 + i) | 0)
      }
    } else {
      f("  <no stack trace available>")
    };
    let wCause = this;
    while (true) {
      const jsx$2 = wCause;
      const this$1 = wCause;
      let jsx$1;
      if ((jsx$2 !== this$1.e$1)) {
        const this$2 = wCause;
        jsx$1 = (this$2.e$1 !== null)
      } else {
        jsx$1 = false
      };
      if (jsx$1) {
        const parentTrace = wCause.getStackTrace__Ajl_StackTraceElement();
        const this$3 = wCause;
        wCause = this$3.e$1;
        const thisTrace = wCause.getStackTrace__Ajl_StackTraceElement();
        const thisLength = thisTrace.u.length;
        const parentLength = parentTrace.u.length;
        const arg1$2 = ("Caused by: " + wCause.toString__T());
        f(arg1$2);
        if ((thisLength !== 0)) {
          let sameFrameCount = 0;
          while (true) {
            let jsx$3;
            if (((sameFrameCount < thisLength) && (sameFrameCount < parentLength))) {
              const x = thisTrace.u[(((-1) + ((thisLength - sameFrameCount) | 0)) | 0)];
              const x$2 = parentTrace.u[(((-1) + ((parentLength - sameFrameCount) | 0)) | 0)];
              jsx$3 = ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
            } else {
              jsx$3 = false
            };
            if (jsx$3) {
              sameFrameCount = ((1 + sameFrameCount) | 0)
            } else {
              break
            }
          };
          if ((sameFrameCount > 0)) {
            sameFrameCount = (((-1) + sameFrameCount) | 0)
          };
          const lengthToPrint = ((thisLength - sameFrameCount) | 0);
          let i$2 = 0;
          while ((i$2 < lengthToPrint)) {
            const arg1$3 = ("  at " + thisTrace.u[i$2]);
            f(arg1$3);
            i$2 = ((1 + i$2) | 0)
          };
          if ((sameFrameCount > 0)) {
            const arg1$4 = (("  ... " + sameFrameCount) + " more");
            f(arg1$4)
          }
        } else {
          f("  <no stack trace available>")
        }
      } else {
        break
      }
    }
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
  apply__scm_Builder() {
    return new $c_scm_StringBuilder().init___()
  };
  apply__O__scm_Builder(from) {
    return new $c_scm_StringBuilder().init___()
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
const $f_s_Product2__productElement__I__O = (function($thiz, n) {
  switch (n) {
    case 0: {
      return $thiz.$$und1$f;
      break
    }
    case 1: {
      return $thiz.$$und2$f;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
    }
  }
});
class $c_s_concurrent_BlockContext$DefaultBlockContext$ extends $c_O {
  init___() {
    return this
  };
}
const $d_s_concurrent_BlockContext$DefaultBlockContext$ = new $TypeData().initClass({
  s_concurrent_BlockContext$DefaultBlockContext$: 0
}, false, "scala.concurrent.BlockContext$DefaultBlockContext$", {
  s_concurrent_BlockContext$DefaultBlockContext$: 1,
  O: 1,
  s_concurrent_BlockContext: 1
});
$c_s_concurrent_BlockContext$DefaultBlockContext$.prototype.$classData = $d_s_concurrent_BlockContext$DefaultBlockContext$;
let $n_s_concurrent_BlockContext$DefaultBlockContext$ = (void 0);
const $m_s_concurrent_BlockContext$DefaultBlockContext$ = (function() {
  if ((!$n_s_concurrent_BlockContext$DefaultBlockContext$)) {
    $n_s_concurrent_BlockContext$DefaultBlockContext$ = new $c_s_concurrent_BlockContext$DefaultBlockContext$().init___()
  };
  return $n_s_concurrent_BlockContext$DefaultBlockContext$
});
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
const $f_sc_Iterator__forall__F1__Z = (function($thiz, p) {
  let res = true;
  while ((res && $thiz.hasNext__Z())) {
    res = (!(!p.apply__O__O($thiz.next__O())))
  };
  return res
});
const $f_sc_Iterator__foreach__F1__V = (function($thiz, f) {
  while ($thiz.hasNext__Z()) {
    f.apply__O__O($thiz.next__O())
  }
});
const $f_sc_Iterator__toStream__sci_Stream = (function($thiz) {
  if ($thiz.hasNext__Z()) {
    const hd = $thiz.next__O();
    const tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
      return (function() {
        return $this.toStream__sci_Stream()
      })
    })($thiz));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  } else {
    $m_sci_Stream$();
    return $m_sci_Stream$Empty$()
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
  apply__scm_Builder() {
    return this.$$outer$1.newBuilder__scm_Builder()
  };
  apply__O__scm_Builder(from) {
    const from$1 = from;
    return from$1.companion__scg_GenericCompanion().newBuilder__scm_Builder()
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
const $is_scg_GenTraversableFactory$GenericCanBuildFrom = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scg_GenTraversableFactory$GenericCanBuildFrom)))
});
const $isArrayOf_scg_GenTraversableFactory$GenericCanBuildFrom = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scg_GenTraversableFactory$GenericCanBuildFrom)))
});
class $c_scg_MapFactory extends $c_scg_GenMapFactory {
}
class $c_sci_HashMap$$anon$2 extends $c_sci_HashMap$Merger {
  constructor() {
    super();
    this.invert$2 = null;
    this.mergef$1$f = null
  };
  init___F2(mergef$1) {
    this.mergef$1$f = mergef$1;
    this.invert$2 = new $c_sci_HashMap$$anon$2$$anon$3().init___sci_HashMap$$anon$2(this);
    return this
  };
  apply__T2__T2__T2(kv1, kv2) {
    return this.mergef$1$f.apply__O__O__O(kv1, kv2)
  };
}
const $d_sci_HashMap$$anon$2 = new $TypeData().initClass({
  sci_HashMap$$anon$2: 0
}, false, "scala.collection.immutable.HashMap$$anon$2", {
  sci_HashMap$$anon$2: 1,
  sci_HashMap$Merger: 1,
  O: 1
});
$c_sci_HashMap$$anon$2.prototype.$classData = $d_sci_HashMap$$anon$2;
class $c_sci_HashMap$$anon$2$$anon$3 extends $c_sci_HashMap$Merger {
  constructor() {
    super();
    this.$$outer$2 = null
  };
  apply__T2__T2__T2(kv1, kv2) {
    return this.$$outer$2.mergef$1$f.apply__O__O__O(kv2, kv1)
  };
  init___sci_HashMap$$anon$2($$outer) {
    if (($$outer === null)) {
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
    } else {
      this.$$outer$2 = $$outer
    };
    return this
  };
}
const $d_sci_HashMap$$anon$2$$anon$3 = new $TypeData().initClass({
  sci_HashMap$$anon$2$$anon$3: 0
}, false, "scala.collection.immutable.HashMap$$anon$2$$anon$3", {
  sci_HashMap$$anon$2$$anon$3: 1,
  sci_HashMap$Merger: 1,
  O: 1
});
$c_sci_HashMap$$anon$2$$anon$3.prototype.$classData = $d_sci_HashMap$$anon$2$$anon$3;
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
const $f_scm_Builder__sizeHint__sc_TraversableLike__V = (function($thiz, coll) {
  const x1 = coll.sizeHintIfCheap__I();
  switch (x1) {
    case (-1): {
      break
    }
    default: {
      $thiz.sizeHint__I__V(x1)
    }
  }
});
const $f_scm_Builder__sizeHint__sc_TraversableLike__I__V = (function($thiz, coll, delta) {
  const x1 = coll.sizeHintIfCheap__I();
  switch (x1) {
    case (-1): {
      break
    }
    default: {
      $thiz.sizeHint__I__V(((x1 + delta) | 0))
    }
  }
});
const $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V = (function($thiz, size, boundingColl) {
  const x1 = boundingColl.sizeHintIfCheap__I();
  switch (x1) {
    case (-1): {
      break
    }
    default: {
      $thiz.sizeHint__I__V(((size < x1) ? size : x1))
    }
  }
});
const $is_scm_Builder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Builder)))
});
const $isArrayOf_scm_Builder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Builder)))
});
class $c_sr_AbstractFunction0 extends $c_O {
  toString__T() {
    return "<function0>"
  };
}
class $c_sr_AbstractFunction1 extends $c_O {
  toString__T() {
    return "<function1>"
  };
}
class $c_sr_AbstractFunction2 extends $c_O {
  toString__T() {
    return "<function2>"
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
const $isArrayOf_sr_BoxedUnit = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_BoxedUnit)))
});
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
class $c_sr_ObjectRef extends $c_O {
  constructor() {
    super();
    this.elem$1 = null
  };
  toString__T() {
    const obj = this.elem$1;
    return ("" + obj)
  };
  init___O(elem) {
    this.elem$1 = elem;
    return this
  };
}
const $d_sr_ObjectRef = new $TypeData().initClass({
  sr_ObjectRef: 0
}, false, "scala.runtime.ObjectRef", {
  sr_ObjectRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_ObjectRef.prototype.$classData = $d_sr_ObjectRef;
let $b_Lio_scalajs_nodejs_child$undprocess_SpawnOptions = (void 0);
const $a_Lio_scalajs_nodejs_child$undprocess_SpawnOptions = (function() {
  if ((!$b_Lio_scalajs_nodejs_child$undprocess_SpawnOptions)) {
    class $c_Lio_scalajs_nodejs_child$undprocess_SpawnOptions extends $g.Object {
      constructor(...arg$rest) {
        const cwd = ((arg$rest[0] === (void 0)) ? $m_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$().$$lessinit$greater$default$1__sjs_js_UndefOr() : arg$rest[0]);
        const env = ((arg$rest[1] === (void 0)) ? $m_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$().$$lessinit$greater$default$2__sjs_js_Any() : arg$rest[1]);
        const argv0 = ((arg$rest[2] === (void 0)) ? $m_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$().$$lessinit$greater$default$3__sjs_js_UndefOr() : arg$rest[2]);
        const stdio = ((arg$rest[3] === (void 0)) ? $m_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$().$$lessinit$greater$default$4__sjs_js_UndefOr() : arg$rest[3]);
        const detached = ((arg$rest[4] === (void 0)) ? $m_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$().$$lessinit$greater$default$5__sjs_js_UndefOr() : arg$rest[4]);
        const uid = ((arg$rest[5] === (void 0)) ? $m_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$().$$lessinit$greater$default$6__sjs_js_UndefOr() : arg$rest[5]);
        const gid = ((arg$rest[6] === (void 0)) ? $m_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$().$$lessinit$greater$default$7__sjs_js_UndefOr() : arg$rest[6]);
        const shell = ((arg$rest[7] === (void 0)) ? $m_Lio_scalajs_nodejs_child$undprocess_SpawnOptions$().$$lessinit$greater$default$8__sjs_js_UndefOr() : arg$rest[7]);
        super();
        $g.Object.defineProperty(this, "cwd", {
          "configurable": true,
          "enumerable": true,
          "writable": true,
          "value": null
        });
        $g.Object.defineProperty(this, "env", {
          "configurable": true,
          "enumerable": true,
          "writable": true,
          "value": null
        });
        $g.Object.defineProperty(this, "argv0", {
          "configurable": true,
          "enumerable": true,
          "writable": true,
          "value": null
        });
        $g.Object.defineProperty(this, "stdio", {
          "configurable": true,
          "enumerable": true,
          "writable": true,
          "value": null
        });
        $g.Object.defineProperty(this, "detached", {
          "configurable": true,
          "enumerable": true,
          "writable": true,
          "value": null
        });
        $g.Object.defineProperty(this, "uid", {
          "configurable": true,
          "enumerable": true,
          "writable": true,
          "value": null
        });
        $g.Object.defineProperty(this, "gid", {
          "configurable": true,
          "enumerable": true,
          "writable": true,
          "value": null
        });
        $g.Object.defineProperty(this, "shell", {
          "configurable": true,
          "enumerable": true,
          "writable": true,
          "value": null
        });
        this.cwd = cwd;
        this.env = env;
        this.argv0 = argv0;
        this.stdio = stdio;
        this.detached = detached;
        this.uid = uid;
        this.gid = gid;
        this.shell = shell
      };
    }
    $b_Lio_scalajs_nodejs_child$undprocess_SpawnOptions = $c_Lio_scalajs_nodejs_child$undprocess_SpawnOptions
  };
  return $b_Lio_scalajs_nodejs_child$undprocess_SpawnOptions
});
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
  equals__O__Z(that) {
    if ($is_jl_Character(that)) {
      const jsx$1 = this.value$1;
      const this$1 = that;
      return (jsx$1 === this$1.value$1)
    } else {
      return false
    }
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
const $is_jl_Character = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Character)))
});
const $isArrayOf_jl_Character = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Character)))
});
const $d_jl_Character = new $TypeData().initClass({
  jl_Character: 0
}, false, "java.lang.Character", {
  jl_Character: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_jl_Character.prototype.$classData = $d_jl_Character;
class $c_jl_Character$ extends $c_O {
  constructor() {
    super();
    this.java$lang$Character$$charTypesFirst256$1 = null;
    this.charTypeIndices$1 = null;
    this.charTypes$1 = null;
    this.isMirroredIndices$1 = null;
    this.bitmap$0$1 = 0
  };
  init___() {
    return this
  };
  digit__C__I__I(c, radix) {
    return (((radix > 36) || (radix < 2)) ? (-1) : ((((c >= 48) && (c <= 57)) && ((((-48) + c) | 0) < radix)) ? (((-48) + c) | 0) : ((((c >= 65) && (c <= 90)) && ((((-65) + c) | 0) < (((-10) + radix) | 0))) ? (((-55) + c) | 0) : ((((c >= 97) && (c <= 122)) && ((((-97) + c) | 0) < (((-10) + radix) | 0))) ? (((-87) + c) | 0) : ((((c >= 65313) && (c <= 65338)) && ((((-65313) + c) | 0) < (((-10) + radix) | 0))) ? (((-65303) + c) | 0) : ((((c >= 65345) && (c <= 65370)) && ((((-65345) + c) | 0) < (((-10) + radix) | 0))) ? (((-65303) + c) | 0) : (-1)))))))
  };
}
const $d_jl_Character$ = new $TypeData().initClass({
  jl_Character$: 0
}, false, "java.lang.Character$", {
  jl_Character$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Character$.prototype.$classData = $d_jl_Character$;
let $n_jl_Character$ = (void 0);
const $m_jl_Character$ = (function() {
  if ((!$n_jl_Character$)) {
    $n_jl_Character$ = new $c_jl_Character$().init___()
  };
  return $n_jl_Character$
});
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
class $c_jl_Error extends $c_jl_Throwable {
}
const $is_jl_Error = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Error)))
});
const $isArrayOf_jl_Error = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Error)))
});
class $c_jl_Exception extends $c_jl_Throwable {
}
class $c_jl_Integer$ extends $c_O {
  init___() {
    return this
  };
  fail$1__p1__T__sr_Nothing$(s$1) {
    throw new $c_jl_NumberFormatException().init___T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["For input string: \"", "\""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([s$1])))
  };
  parseInt__T__I__I(s, radix) {
    let jsx$1;
    if ((s === null)) {
      jsx$1 = true
    } else {
      const this$2 = new $c_sci_StringOps().init___T(s);
      const $$this = this$2.repr$1;
      jsx$1 = (($$this.length | 0) === 0)
    };
    if (((jsx$1 || (radix < 2)) || (radix > 36))) {
      this.fail$1__p1__T__sr_Nothing$(s)
    } else {
      let i = ((((65535 & (s.charCodeAt(0) | 0)) === 45) || ((65535 & (s.charCodeAt(0) | 0)) === 43)) ? 1 : 0);
      const this$12 = new $c_sci_StringOps().init___T(s);
      const $$this$1 = this$12.repr$1;
      if ((($$this$1.length | 0) <= i)) {
        this.fail$1__p1__T__sr_Nothing$(s)
      } else {
        while (true) {
          const jsx$2 = i;
          const this$16 = new $c_sci_StringOps().init___T(s);
          const $$this$2 = this$16.repr$1;
          if ((jsx$2 < ($$this$2.length | 0))) {
            const jsx$3 = $m_jl_Character$();
            const index = i;
            if ((jsx$3.digit__C__I__I((65535 & (s.charCodeAt(index) | 0)), radix) < 0)) {
              this.fail$1__p1__T__sr_Nothing$(s)
            };
            i = ((1 + i) | 0)
          } else {
            break
          }
        };
        const res = (+$g.parseInt(s, radix));
        return (((res !== res) || ((res > 2147483647) || (res < (-2147483648)))) ? this.fail$1__p1__T__sr_Nothing$(s) : $doubleToInt(res))
      }
    }
  };
  bitCount__I__I(i) {
    const t1 = ((i - (1431655765 & (i >> 1))) | 0);
    const t2 = (((858993459 & t1) + (858993459 & (t1 >> 2))) | 0);
    return ($imul(16843009, (252645135 & ((t2 + (t2 >> 4)) | 0))) >> 24)
  };
}
const $d_jl_Integer$ = new $TypeData().initClass({
  jl_Integer$: 0
}, false, "java.lang.Integer$", {
  jl_Integer$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Integer$.prototype.$classData = $d_jl_Integer$;
let $n_jl_Integer$ = (void 0);
const $m_jl_Integer$ = (function() {
  if ((!$n_jl_Integer$)) {
    $n_jl_Integer$ = new $c_jl_Integer$().init___()
  };
  return $n_jl_Integer$
});
class $c_ju_concurrent_atomic_AtomicReference extends $c_O {
  constructor() {
    super();
    this.value$1 = null
  };
  compareAndSet__O__O__Z(expect, update) {
    if ((expect === this.value$1)) {
      this.value$1 = update;
      return true
    } else {
      return false
    }
  };
  init___O(value) {
    this.value$1 = value;
    return this
  };
}
class $c_s_Console$ extends $c_s_DeprecatedConsole {
  constructor() {
    super();
    this.outVar$2 = null;
    this.errVar$2 = null;
    this.inVar$2 = null
  };
  init___() {
    $n_s_Console$ = this;
    this.outVar$2 = new $c_s_util_DynamicVariable().init___O($m_jl_System$().out$1);
    this.errVar$2 = new $c_s_util_DynamicVariable().init___O($m_jl_System$().err$1);
    this.inVar$2 = new $c_s_util_DynamicVariable().init___O(null);
    return this
  };
}
const $d_s_Console$ = new $TypeData().initClass({
  s_Console$: 0
}, false, "scala.Console$", {
  s_Console$: 1,
  s_DeprecatedConsole: 1,
  O: 1,
  s_io_AnsiColor: 1
});
$c_s_Console$.prototype.$classData = $d_s_Console$;
let $n_s_Console$ = (void 0);
const $m_s_Console$ = (function() {
  if ((!$n_s_Console$)) {
    $n_s_Console$ = new $c_s_Console$().init___()
  };
  return $n_s_Console$
});
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
  assert__Z__V(assertion) {
    if ((!assertion)) {
      throw new $c_jl_AssertionError().init___O("assertion failed")
    }
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
class $c_s_concurrent_BatchingExecutor$Batch extends $c_O {
  constructor() {
    super();
    this.initial$1 = null;
    this.parentBlockContext$1 = null;
    this.$$outer$1 = null
  };
  init___s_concurrent_BatchingExecutor__sci_List($$outer, initial) {
    this.initial$1 = initial;
    if (($$outer === null)) {
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
    } else {
      this.$$outer$1 = $$outer
    };
    return this
  };
  processBatch$1__p1__sci_List__V(batch) {
    _processBatch: while (true) {
      const x1 = batch;
      const x$2 = $m_sci_Nil$();
      if ((!x$2.equals__O__Z(x1))) {
        if ($is_sci_$colon$colon(x1)) {
          const x2 = x1;
          const head = x2.head$5;
          const tail = x2.tl$5;
          this.$$outer$1.scala$concurrent$BatchingExecutor$$$undtasksLocal$1.set__O__V(tail);
          try {
            head.run__V()
          } catch (e) {
            const e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
            if ((e$2 !== null)) {
              const remaining = this.$$outer$1.scala$concurrent$BatchingExecutor$$$undtasksLocal$1.get__O();
              this.$$outer$1.scala$concurrent$BatchingExecutor$$$undtasksLocal$1.set__O__V($m_sci_Nil$());
              const r = new $c_s_concurrent_BatchingExecutor$Batch().init___s_concurrent_BatchingExecutor__sci_List(this.$$outer$1, remaining);
              r.run__V();
              throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
            } else {
              throw e
            }
          };
          batch = this.$$outer$1.scala$concurrent$BatchingExecutor$$$undtasksLocal$1.get__O();
          continue _processBatch
        };
        throw new $c_s_MatchError().init___O(x1)
      };
      break
    }
  };
  run__V() {
    $m_s_Predef$().require__Z__V((this.$$outer$1.scala$concurrent$BatchingExecutor$$$undtasksLocal$1.get__O() === null));
    const prevBlockContext = $m_s_concurrent_BlockContext$().current__s_concurrent_BlockContext();
    const this$1 = $m_s_concurrent_BlockContext$();
    const old = this$1.contextLocal$1.get__O();
    try {
      this$1.contextLocal$1.set__O__V(this);
      try {
        this.parentBlockContext$1 = prevBlockContext;
        this.processBatch$1__p1__sci_List__V(this.initial$1)
      } finally {
        this.$$outer$1.scala$concurrent$BatchingExecutor$$$undtasksLocal$1.remove__V();
        this.parentBlockContext$1 = null
      }
    } finally {
      this$1.contextLocal$1.set__O__V(old)
    }
  };
}
const $d_s_concurrent_BatchingExecutor$Batch = new $TypeData().initClass({
  s_concurrent_BatchingExecutor$Batch: 0
}, false, "scala.concurrent.BatchingExecutor$Batch", {
  s_concurrent_BatchingExecutor$Batch: 1,
  O: 1,
  jl_Runnable: 1,
  s_concurrent_BlockContext: 1
});
$c_s_concurrent_BatchingExecutor$Batch.prototype.$classData = $d_s_concurrent_BatchingExecutor$Batch;
class $c_s_concurrent_impl_CallbackRunnable extends $c_O {
  constructor() {
    super();
    this.executor$1 = null;
    this.onComplete$1 = null;
    this.value$1 = null
  };
  run__V() {
    $m_s_Predef$().require__Z__V((this.value$1 !== null));
    try {
      this.onComplete$1.apply__O__O(this.value$1)
    } catch (e) {
      const e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        matchEnd8: {
          const o11 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2);
          if ((!o11.isEmpty__Z())) {
            const e$3 = o11.get__O();
            this.executor$1.reportFailure__jl_Throwable__V(e$3);
            break matchEnd8
          };
          throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
        }
      } else {
        throw e
      }
    }
  };
  init___s_concurrent_ExecutionContext__F1(executor, onComplete) {
    this.executor$1 = executor;
    this.onComplete$1 = onComplete;
    this.value$1 = null;
    return this
  };
  executeWithValue__s_util_Try__V(v) {
    $m_s_Predef$().require__Z__V((this.value$1 === null));
    this.value$1 = v;
    try {
      this.executor$1.execute__jl_Runnable__V(this)
    } catch (e) {
      const e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        matchEnd8: {
          const o11 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2);
          if ((!o11.isEmpty__Z())) {
            const t = o11.get__O();
            this.executor$1.reportFailure__jl_Throwable__V(t);
            break matchEnd8
          };
          throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
        }
      } else {
        throw e
      }
    }
  };
}
const $is_s_concurrent_impl_CallbackRunnable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_concurrent_impl_CallbackRunnable)))
});
const $isArrayOf_s_concurrent_impl_CallbackRunnable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_concurrent_impl_CallbackRunnable)))
});
const $d_s_concurrent_impl_CallbackRunnable = new $TypeData().initClass({
  s_concurrent_impl_CallbackRunnable: 0
}, false, "scala.concurrent.impl.CallbackRunnable", {
  s_concurrent_impl_CallbackRunnable: 1,
  O: 1,
  jl_Runnable: 1,
  s_concurrent_OnCompleteRunnable: 1
});
$c_s_concurrent_impl_CallbackRunnable.prototype.$classData = $d_s_concurrent_impl_CallbackRunnable;
const $f_s_concurrent_impl_Promise__transformWith__F1__s_concurrent_ExecutionContext__s_concurrent_Future = (function($thiz, f, executor) {
  const p = new $c_s_concurrent_impl_Promise$DefaultPromise().init___();
  $thiz.onComplete__F1__s_concurrent_ExecutionContext__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, f$1, p$1) {
    return (function(v$2) {
      const v = v$2;
      try {
        const x1 = f$1.apply__O__O(v);
        if ((x1 === $this)) {
          return $f_s_concurrent_Promise__complete__s_util_Try__s_concurrent_Promise(p$1, v)
        } else if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
          const x2 = x1;
          x2.link__p2__s_concurrent_impl_Promise$DefaultPromise__V(p$1.compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise());
          return (void 0)
        } else {
          return $f_s_concurrent_Promise__tryCompleteWith__s_concurrent_Future__s_concurrent_Promise(p$1, x1)
        }
      } catch (e) {
        const e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
        if ((e$2 !== null)) {
          const o11 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2);
          if ((!o11.isEmpty__Z())) {
            const t = o11.get__O();
            return $f_s_concurrent_Promise__failure__jl_Throwable__s_concurrent_Promise(p$1, t)
          };
          throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
        } else {
          throw e
        }
      }
    })
  })($thiz, f, p)), executor);
  return p
});
const $f_s_concurrent_impl_Promise__toString__T = (function($thiz) {
  const x1 = $thiz.value__s_Option();
  if ($is_s_Some(x1)) {
    const x2 = x1;
    const result = x2.value$2;
    return (("Future(" + result) + ")")
  } else {
    const x = $m_s_None$();
    if ((x === x1)) {
      return "Future(<not completed>)"
    } else {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
});
const $f_s_concurrent_impl_Promise__transform__F1__s_concurrent_ExecutionContext__s_concurrent_Future = (function($thiz, f, executor) {
  const p = new $c_s_concurrent_impl_Promise$DefaultPromise().init___();
  $thiz.onComplete__F1__s_concurrent_ExecutionContext__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, f$1, p$1) {
    return (function(result$2) {
      const result = result$2;
      const result$1 = $f_s_concurrent_impl_Promise__liftedTree1$1__ps_concurrent_impl_Promise__F1__s_util_Try__s_util_Try($this, f$1, result);
      return $f_s_concurrent_Promise__complete__s_util_Try__s_concurrent_Promise(p$1, result$1)
    })
  })($thiz, f, p)), executor);
  return p
});
const $f_s_concurrent_impl_Promise__liftedTree1$1__ps_concurrent_impl_Promise__F1__s_util_Try__s_util_Try = (function($thiz, f$1, result$1) {
  try {
    return f$1.apply__O__O(result$1)
  } catch (e) {
    const e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      const o11 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2);
      if ((!o11.isEmpty__Z())) {
        const t = o11.get__O();
        return new $c_s_util_Failure().init___jl_Throwable(t)
      };
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
    } else {
      throw e
    }
  }
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
const $is_s_math_ScalaNumber = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_math_ScalaNumber)))
});
const $isArrayOf_s_math_ScalaNumber = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_math_ScalaNumber)))
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
  apply__scm_Builder() {
    $m_sc_IndexedSeq$();
    $m_sci_IndexedSeq$();
    $m_sci_Vector$();
    return new $c_sci_VectorBuilder().init___()
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
  apply__scm_Builder() {
    return this.$$outer$2.newBuilder__scm_Builder()
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
class $c_sci_Stream$StreamCanBuildFrom extends $c_scg_GenTraversableFactory$GenericCanBuildFrom {
  init___() {
    $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $m_sci_Stream$());
    return this
  };
}
const $d_sci_Stream$StreamCanBuildFrom = new $TypeData().initClass({
  sci_Stream$StreamCanBuildFrom: 0
}, false, "scala.collection.immutable.Stream$StreamCanBuildFrom", {
  sci_Stream$StreamCanBuildFrom: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_sci_Stream$StreamCanBuildFrom.prototype.$classData = $d_sci_Stream$StreamCanBuildFrom;
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
class $c_sjsr_AnonFunction0 extends $c_sr_AbstractFunction0 {
  constructor() {
    super();
    this.f$2 = null
  };
  apply__O() {
    return (0, this.f$2)()
  };
  init___sjs_js_Function0(f) {
    this.f$2 = f;
    return this
  };
}
const $d_sjsr_AnonFunction0 = new $TypeData().initClass({
  sjsr_AnonFunction0: 0
}, false, "scala.scalajs.runtime.AnonFunction0", {
  sjsr_AnonFunction0: 1,
  sr_AbstractFunction0: 1,
  O: 1,
  F0: 1
});
$c_sjsr_AnonFunction0.prototype.$classData = $d_sjsr_AnonFunction0;
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
class $c_sjsr_AnonFunction2 extends $c_sr_AbstractFunction2 {
  constructor() {
    super();
    this.f$2 = null
  };
  init___sjs_js_Function2(f) {
    this.f$2 = f;
    return this
  };
  apply__O__O__O(arg1, arg2) {
    return (0, this.f$2)(arg1, arg2)
  };
}
const $d_sjsr_AnonFunction2 = new $TypeData().initClass({
  sjsr_AnonFunction2: 0
}, false, "scala.scalajs.runtime.AnonFunction2", {
  sjsr_AnonFunction2: 1,
  sr_AbstractFunction2: 1,
  O: 1,
  F2: 1
});
$c_sjsr_AnonFunction2.prototype.$classData = $d_sjsr_AnonFunction2;
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
class $c_sr_AbstractPartialFunction extends $c_O {
  apply__O__O(x) {
    return this.applyOrElse__O__F1__O(x, $m_s_PartialFunction$().empty$undpf$1)
  };
  toString__T() {
    return "<function1>"
  };
}
const $d_sr_Nothing$ = new $TypeData().initClass({
  sr_Nothing$: 0
}, false, "scala.runtime.Nothing$", {
  sr_Nothing$: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
class $c_Ljava_io_OutputStream extends $c_O {
}
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__getLanguageName__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T = (function($this) {
  return "Scala"
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__startServerProcess__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T__sjs_js_$bar = (function($this, projectPath) {
  const jsx$1 = $m_sjs_js_JSConverters$JSRichFuture$();
  const f = $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__getJavaHome__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__s_concurrent_ExecutionContext__s_concurrent_Future($this, $m_s_concurrent_ExecutionContext$Implicits$().global__s_concurrent_ExecutionContext()).map__F1__s_concurrent_ExecutionContext__s_concurrent_Future(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2, projectPath$1) {
    return (function(javaHome$2) {
      const javaHome = javaHome$2;
      return $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__launchServer__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T__T__Lio_scalajs_nodejs_child$undprocess_ChildProcess(this$2, javaHome, projectPath$1)
    })
  })($this, projectPath)), $m_s_concurrent_ExecutionContext$Implicits$().global__s_concurrent_ExecutionContext());
  const a = jsx$1.toJSPromise$extension__s_concurrent_Future__s_concurrent_ExecutionContext__sjs_js_Promise(f, $m_s_concurrent_ExecutionContext$Implicits$().global__s_concurrent_ExecutionContext());
  return a
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__preInitialization__Llaughedelic_atom_ide_scala_ScalaLanguageClient__sjs_js_Any__V = (function($this, connection) {
  $g.atom.notifications.onDidAddNotification((function(this$2$1) {
    return (function(notification$2) {
      const notifications = $g.atom.notifications.getNotifications();
      const array = [];
      let i = 0;
      const len = (notifications.length | 0);
      while ((i < len)) {
        const index = i;
        const arg1 = notifications[index];
        if (((((!$m_sr_BoxesRunTime$().equals__O__O__Z(arg1, notification$2)) && (arg1.getType() === notification$2.getType())) && (arg1.getMessage() === notification$2.getMessage())) !== false)) {
          array.push(arg1)
        };
        i = ((1 + i) | 0)
      };
      let i$1 = 0;
      const len$1 = (array.length | 0);
      while ((i$1 < len$1)) {
        const index$1 = i$1;
        const arg1$1 = array[index$1];
        arg1$1.dismiss();
        i$1 = ((1 + i$1) | 0)
      }
    })
  })($this))
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__getGrammarScopes__Llaughedelic_atom_ide_scala_ScalaLanguageClient__sjs_js_Array = (function($this) {
  return ["source.scala"]
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__getServerName__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T = (function($this) {
  return $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__server__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_ServerType($this).name__T()
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__server__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_ServerType = (function($this) {
  return ((!(!(!$this.bitmap$0$3))) ? $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__server$lzycompute__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_ServerType($this) : $this.server$3)
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__getJavaHome__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__s_concurrent_ExecutionContext__s_concurrent_Future = (function($this, ec) {
  const this$21 = $m_s_concurrent_Future$().apply__F0__s_concurrent_ExecutionContext__s_concurrent_Future(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2) {
    return (function() {
      return $g.atom.config.get("ide-scala.jvm.javaHome")
    })
  })($this)), ec).filter__F1__s_concurrent_ExecutionContext__s_concurrent_Future(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$3$1) {
    return (function(x$1$2) {
      const x$1 = x$1$2;
      const this$6 = new $c_sci_StringOps().init___T(x$1);
      return $f_sc_TraversableOnce__nonEmpty__Z(this$6)
    })
  })($this)), ec).fallbackTo__s_concurrent_Future__s_concurrent_Future($m_Llaughedelic_atom_ide_scala_findJavaHome$().apply__Z__s_concurrent_Future(false)).filter__F1__s_concurrent_ExecutionContext__s_concurrent_Future(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$4$1) {
    return (function(javaHome$2) {
      const javaHome = javaHome$2;
      const jsx$2 = $i_fs;
      const a = $i_path.join(javaHome, "lib", "tools.jar");
      const jsx$1 = jsx$2.existsSync(a);
      if ((!(!jsx$1))) {
        const jsx$4 = $i_fs;
        const a$1 = $i_path.join(javaHome, "bin", "java");
        const jsx$3 = jsx$4.existsSync(a$1);
        return (!(!jsx$3))
      } else {
        return false
      }
    })
  })($this)), ec);
  const s$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$5$1) {
    return (function(x$2) {
      const x = x$2;
      return x
    })
  })($this));
  const f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$6$1) {
    return (function(th$2) {
      const th = th$2;
      const jsx$5 = $g.atom.notifications;
      const s = this$6$1.name;
      jsx$5.addError("Java Home is not found or is invalid. Try to set it explicitly in the plugin settings.", {
        "dismissable": true,
        "detail": s
      });
      return th
    })
  })($this));
  return $f_s_concurrent_Future__transform__F1__F1__s_concurrent_ExecutionContext__s_concurrent_Future(this$21, s$1, f, ec)
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__server$lzycompute__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_ServerType = (function($this) {
  if (($this === null)) {
    throw new $c_jl_NullPointerException().init___()
  };
  if ((!(!(!$this.bitmap$0$3)))) {
    $this.server$3 = $m_Llaughedelic_atom_ide_scala_ServerType$().fromConfig__Llaughedelic_atom_ide_scala_ServerType();
    $this.bitmap$0$3 = true
  };
  return $this.server$3
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__launchServer__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T__T__Lio_scalajs_nodejs_child$undprocess_ChildProcess = (function($this, javaHome, projectPath) {
  const toolsJar = $i_path.join(javaHome, "lib", "tools.jar");
  const packagePath = $g.atom.packages.getLoadedPackage("ide-scala").path;
  const coursierJar = $i_path.join(packagePath, "coursier");
  const serverVersion = $g.atom.config.get("ide-scala.serverVersion");
  const javaBin = $i_path.join(javaHome, "bin", "java");
  const jsx$6 = $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__server__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_ServerType($this).javaArgs__T__sc_Seq(projectPath);
  const array = $g.atom.config.get("ide-scala.jvm.javaOpts");
  const jsx$5 = new $c_sjs_js_ArrayOps().init___sjs_js_Array(array);
  const this$11 = $m_sc_Seq$();
  const jsx$4 = jsx$6.$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(jsx$5, this$11.ReusableCBFInstance$2);
  const jsx$3 = $m_sc_Seq$().apply__sc_Seq__sc_GenTraversable(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["-jar", coursierJar, "launch", "--quiet", "--extra-jars", toolsJar]));
  const this$12 = $m_sc_Seq$();
  const jsx$2 = jsx$4.$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(jsx$3, this$12.ReusableCBFInstance$2);
  const jsx$1 = $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__server__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_ServerType($this).coursierArgs__T__sc_Seq(serverVersion);
  const this$13 = $m_sc_Seq$();
  const javaArgs = jsx$2.$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(jsx$1, this$13.ReusableCBFInstance$2);
  const this$14 = $m_sc_Seq$();
  const x = javaArgs.$$plus$colon__O__scg_CanBuildFrom__O(javaBin, this$14.ReusableCBFInstance$2).mkString__T__T("\n");
  const this$16 = $m_s_Console$();
  const this$17 = this$16.outVar$2.v$1;
  this$17.java$lang$JSConsoleBasedPrintStream$$printString__T__V((x + "\n"));
  const jsx$8 = $i_child$005fprocess;
  const this$20 = $m_sjsr_package$();
  let jsx$7;
  if ($is_sjs_js_ArrayOps(javaArgs)) {
    const x2 = javaArgs;
    jsx$7 = x2.scala$scalajs$js$ArrayOps$$array$f
  } else if ($is_sjs_js_WrappedArray(javaArgs)) {
    const x3 = javaArgs;
    jsx$7 = x3.array$6
  } else {
    const result = [];
    javaArgs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, result$1) {
      return (function(x$2) {
        return (result$1.push(x$2) | 0)
      })
    })(this$20, result)));
    jsx$7 = result
  };
  const a = new ($a_Lio_scalajs_nodejs_child$undprocess_SpawnOptions())(projectPath);
  const serverProcess = jsx$8.spawn(javaBin, jsx$7, a);
  $this.captureServerErrors(serverProcess);
  return serverProcess
});
const $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__filterChangeWatchedFiles__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T__Z = (function($this, filePath) {
  return $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__server__p3__Llaughedelic_atom_ide_scala_ScalaLanguageClient__Llaughedelic_atom_ide_scala_ServerType($this).watchFilter__T__Z(filePath)
});
let $b_Llaughedelic_atom_ide_scala_ScalaLanguageClient = (void 0);
const $a_Llaughedelic_atom_ide_scala_ScalaLanguageClient = (function() {
  if ((!$b_Llaughedelic_atom_ide_scala_ScalaLanguageClient)) {
    class $c_Llaughedelic_atom_ide_scala_ScalaLanguageClient extends $i_atom$002dlanguageclient.AutoLanguageClient {
      constructor() {
        super();
        $g.Object.defineProperties(this, {
          server$3: {
            "configurable": true,
            "enumerable": true,
            "writable": true,
            "value": null
          }
        });
        $g.Object.defineProperties(this, {
          bitmap$0$3: {
            "configurable": true,
            "enumerable": true,
            "writable": true,
            "value": false
          }
        })
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
      "filterChangeWatchedFiles"(arg$1) {
        const prep0 = arg$1;
        return $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__filterChangeWatchedFiles__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T__Z(this, prep0)
      };
      "startServerProcess"(arg$1) {
        const prep0 = arg$1;
        return $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__startServerProcess__Llaughedelic_atom_ide_scala_ScalaLanguageClient__T__sjs_js_$bar(this, prep0)
      };
      "preInitialization"(arg$1) {
        const prep0 = arg$1;
        $s_Llaughedelic_atom_ide_scala_ScalaLanguageClient__preInitialization__Llaughedelic_atom_ide_scala_ScalaLanguageClient__sjs_js_Any__V(this, prep0)
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
class $c_jl_AssertionError extends $c_jl_Error {
  init___O(detailMessage) {
    const message = ("" + detailMessage);
    let cause;
    if ($is_jl_Throwable(detailMessage)) {
      const x2 = detailMessage;
      cause = x2
    } else {
      cause = null
    };
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, message, cause);
    return this
  };
}
const $d_jl_AssertionError = new $TypeData().initClass({
  jl_AssertionError: 0
}, false, "java.lang.AssertionError", {
  jl_AssertionError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_AssertionError.prototype.$classData = $d_jl_AssertionError;
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
const $is_jl_InterruptedException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_InterruptedException)))
});
const $isArrayOf_jl_InterruptedException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_InterruptedException)))
});
const $is_jl_LinkageError = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_LinkageError)))
});
const $isArrayOf_jl_LinkageError = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_LinkageError)))
});
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
  init___T(s) {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
    return this
  };
}
const $d_jl_RuntimeException = new $TypeData().initClass({
  jl_RuntimeException: 0
}, false, "java.lang.RuntimeException", {
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_RuntimeException.prototype.$classData = $d_jl_RuntimeException;
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
const $is_jl_ThreadDeath = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_ThreadDeath)))
});
const $isArrayOf_jl_ThreadDeath = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ThreadDeath)))
});
const $is_jl_VirtualMachineError = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_VirtualMachineError)))
});
const $isArrayOf_jl_VirtualMachineError = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_VirtualMachineError)))
});
class $c_ju_concurrent_ExecutionException extends $c_jl_Exception {
  init___T__jl_Throwable(message, cause) {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, message, cause);
    return this
  };
}
const $d_ju_concurrent_ExecutionException = new $TypeData().initClass({
  ju_concurrent_ExecutionException: 0
}, false, "java.util.concurrent.ExecutionException", {
  ju_concurrent_ExecutionException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_concurrent_ExecutionException.prototype.$classData = $d_ju_concurrent_ExecutionException;
class $c_s_Array$ extends $c_s_FallbackArrayBuilding {
  init___() {
    return this
  };
  slowcopy__p2__O__I__O__I__I__V(src, srcPos, dest, destPos, length) {
    let i = srcPos;
    let j = destPos;
    const srcUntil = ((srcPos + length) | 0);
    while ((i < srcUntil)) {
      $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(dest, j, $m_sr_ScalaRunTime$().array$undapply__O__I__O(src, i));
      i = ((1 + i) | 0);
      j = ((1 + j) | 0)
    }
  };
  copy__O__I__O__I__I__V(src, srcPos, dest, destPos, length) {
    const srcClass = $objectGetClass(src);
    if ((srcClass.isArray__Z() && $objectGetClass(dest).isAssignableFrom__jl_Class__Z(srcClass))) {
      $systemArraycopy(src, srcPos, dest, destPos, length)
    } else {
      this.slowcopy__p2__O__I__O__I__I__V(src, srcPos, dest, destPos, length)
    }
  };
}
const $d_s_Array$ = new $TypeData().initClass({
  s_Array$: 0
}, false, "scala.Array$", {
  s_Array$: 1,
  s_FallbackArrayBuilding: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Array$.prototype.$classData = $d_s_Array$;
let $n_s_Array$ = (void 0);
const $m_s_Array$ = (function() {
  if ((!$n_s_Array$)) {
    $n_s_Array$ = new $c_s_Array$().init___()
  };
  return $n_s_Array$
});
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
class $c_s_concurrent_Future$InternalCallbackExecutor$ extends $c_O {
  constructor() {
    super();
    this.scala$concurrent$BatchingExecutor$$$undtasksLocal$1 = null
  };
  init___() {
    $n_s_concurrent_Future$InternalCallbackExecutor$ = this;
    this.scala$concurrent$BatchingExecutor$$$undtasksLocal$1 = new $c_jl_ThreadLocal().init___();
    return this
  };
  reportFailure__jl_Throwable__V(t) {
    throw new $c_jl_IllegalStateException().init___T__jl_Throwable("problem in scala.concurrent internal callback", t)
  };
  execute__jl_Runnable__V(runnable) {
    $f_s_concurrent_BatchingExecutor__execute__jl_Runnable__V(this, runnable)
  };
}
const $d_s_concurrent_Future$InternalCallbackExecutor$ = new $TypeData().initClass({
  s_concurrent_Future$InternalCallbackExecutor$: 0
}, false, "scala.concurrent.Future$InternalCallbackExecutor$", {
  s_concurrent_Future$InternalCallbackExecutor$: 1,
  O: 1,
  s_concurrent_ExecutionContext: 1,
  s_concurrent_BatchingExecutor: 1,
  ju_concurrent_Executor: 1
});
$c_s_concurrent_Future$InternalCallbackExecutor$.prototype.$classData = $d_s_concurrent_Future$InternalCallbackExecutor$;
let $n_s_concurrent_Future$InternalCallbackExecutor$ = (void 0);
const $m_s_concurrent_Future$InternalCallbackExecutor$ = (function() {
  if ((!$n_s_concurrent_Future$InternalCallbackExecutor$)) {
    $n_s_concurrent_Future$InternalCallbackExecutor$ = new $c_s_concurrent_Future$InternalCallbackExecutor$().init___()
  };
  return $n_s_concurrent_Future$InternalCallbackExecutor$
});
const $f_s_concurrent_impl_Promise$KeptPromise$Kept__onComplete__F1__s_concurrent_ExecutionContext__V = (function($thiz, func, executor) {
  new $c_s_concurrent_impl_CallbackRunnable().init___s_concurrent_ExecutionContext__F1(executor, func).executeWithValue__s_util_Try__V($thiz.result__s_util_Try())
});
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
  seq__sc_TraversableOnce() {
    return this
  };
  isEmpty__Z() {
    return $f_sc_Iterator__isEmpty__Z(this)
  };
  toList__sci_List() {
    const this$1 = $m_sci_List$();
    const cbf = this$1.ReusableCBFInstance$2;
    return $f_sc_TraversableOnce__to__scg_CanBuildFrom__O(this, cbf)
  };
  mkString__T__T(sep) {
    return $f_sc_TraversableOnce__mkString__T__T__T__T(this, "", sep, "")
  };
  toString__T() {
    return $f_sc_Iterator__toString__T(this)
  };
  foreach__F1__V(f) {
    $f_sc_Iterator__foreach__F1__V(this, f)
  };
  toVector__sci_Vector() {
    $m_sci_Vector$();
    const cbf = $m_sc_IndexedSeq$().ReusableCBF$6;
    return $f_sc_TraversableOnce__to__scg_CanBuildFrom__O(this, cbf)
  };
  size__I() {
    return $f_sc_TraversableOnce__size__I(this)
  };
  toStream__sci_Stream() {
    return $f_sc_Iterator__toStream__sci_Stream(this)
  };
  addString__scm_StringBuilder__T__T__T__scm_StringBuilder(b, start, sep, end) {
    return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
  };
  isTraversableAgain__Z() {
    return false
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
class $c_scm_GrowingBuilder extends $c_O {
  constructor() {
    super();
    this.empty$1 = null;
    this.elems$1 = null
  };
  $$plus$eq__O__scm_GrowingBuilder(x) {
    this.elems$1.$$plus$eq__O__scg_Growable(x);
    return this
  };
  init___scg_Growable(empty) {
    this.empty$1 = empty;
    this.elems$1 = empty;
    return this
  };
  $$plus$eq__O__scg_Growable(elem) {
    return this.$$plus$eq__O__scm_GrowingBuilder(elem)
  };
  result__O() {
    return this.elems$1
  };
  sizeHintBounded__I__sc_TraversableLike__V(size, boundingColl) {
    $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
  };
  $$plus$eq__O__scm_Builder(elem) {
    return this.$$plus$eq__O__scm_GrowingBuilder(elem)
  };
  sizeHint__I__V(size) {
    /*<skip>*/
  };
  $$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs) {
    return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
  };
}
const $d_scm_GrowingBuilder = new $TypeData().initClass({
  scm_GrowingBuilder: 0
}, false, "scala.collection.mutable.GrowingBuilder", {
  scm_GrowingBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_GrowingBuilder.prototype.$classData = $d_scm_GrowingBuilder;
class $c_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext extends $c_O {
  constructor() {
    super();
    this.resolvedUnitPromise$1 = null
  };
  init___() {
    this.resolvedUnitPromise$1 = $g.Promise.resolve((void 0));
    return this
  };
  scala$scalajs$concurrent$QueueExecutionContext$PromisesExecutionContext$$$anonfun$execute$2__sr_BoxedUnit__jl_Runnable__sjs_js_$bar(x$1, runnable$2) {
    try {
      runnable$2.run__V()
    } catch (e) {
      const e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        e$2.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
      } else {
        throw e
      }
    }
  };
  reportFailure__jl_Throwable__V(t) {
    t.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
  };
  execute__jl_Runnable__V(runnable) {
    this.resolvedUnitPromise$1.then((function(arg$outer, runnable$2) {
      return (function(arg1$2) {
        const arg1 = arg1$2;
        return arg$outer.scala$scalajs$concurrent$QueueExecutionContext$PromisesExecutionContext$$$anonfun$execute$2__sr_BoxedUnit__jl_Runnable__sjs_js_$bar(arg1, runnable$2)
      })
    })(this, runnable))
  };
}
const $d_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext = new $TypeData().initClass({
  sjs_concurrent_QueueExecutionContext$PromisesExecutionContext: 0
}, false, "scala.scalajs.concurrent.QueueExecutionContext$PromisesExecutionContext", {
  sjs_concurrent_QueueExecutionContext$PromisesExecutionContext: 1,
  O: 1,
  s_concurrent_ExecutionContextExecutor: 1,
  s_concurrent_ExecutionContext: 1,
  ju_concurrent_Executor: 1
});
$c_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext.prototype.$classData = $d_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext;
class $c_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext extends $c_O {
  init___() {
    return this
  };
  reportFailure__jl_Throwable__V(t) {
    t.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
  };
  execute__jl_Runnable__V(runnable) {
    $g.setTimeout((function($this, runnable$1) {
      return (function() {
        try {
          runnable$1.run__V()
        } catch (e) {
          const e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
          if ((e$2 !== null)) {
            e$2.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
          } else {
            throw e
          }
        }
      })
    })(this, runnable), 0)
  };
}
const $d_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext = new $TypeData().initClass({
  sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext: 0
}, false, "scala.scalajs.concurrent.QueueExecutionContext$TimeoutsExecutionContext", {
  sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext: 1,
  O: 1,
  s_concurrent_ExecutionContextExecutor: 1,
  s_concurrent_ExecutionContext: 1,
  ju_concurrent_Executor: 1
});
$c_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext.prototype.$classData = $d_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext;
class $c_sjs_concurrent_RunNowExecutionContext$ extends $c_O {
  init___() {
    return this
  };
  reportFailure__jl_Throwable__V(t) {
    t.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
  };
  execute__jl_Runnable__V(runnable) {
    try {
      runnable.run__V()
    } catch (e) {
      const e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        e$2.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
      } else {
        throw e
      }
    }
  };
}
const $d_sjs_concurrent_RunNowExecutionContext$ = new $TypeData().initClass({
  sjs_concurrent_RunNowExecutionContext$: 0
}, false, "scala.scalajs.concurrent.RunNowExecutionContext$", {
  sjs_concurrent_RunNowExecutionContext$: 1,
  O: 1,
  s_concurrent_ExecutionContextExecutor: 1,
  s_concurrent_ExecutionContext: 1,
  ju_concurrent_Executor: 1
});
$c_sjs_concurrent_RunNowExecutionContext$.prototype.$classData = $d_sjs_concurrent_RunNowExecutionContext$;
let $n_sjs_concurrent_RunNowExecutionContext$ = (void 0);
const $m_sjs_concurrent_RunNowExecutionContext$ = (function() {
  if ((!$n_sjs_concurrent_RunNowExecutionContext$)) {
    $n_sjs_concurrent_RunNowExecutionContext$ = new $c_sjs_concurrent_RunNowExecutionContext$().init___()
  };
  return $n_sjs_concurrent_RunNowExecutionContext$
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
class $c_Ljava_io_FilterOutputStream extends $c_Ljava_io_OutputStream {
  constructor() {
    super();
    this.out$2 = null
  };
  init___Ljava_io_OutputStream(out) {
    this.out$2 = out;
    return this
  };
}
class $c_Llaughedelic_atom_ide_scala_ServerType$ extends $c_O {
  init___() {
    return this
  };
  productPrefix__T() {
    return "ServerType"
  };
  productArity__I() {
    return 0
  };
  productElement__I__O(x$1) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
  };
  toString__T() {
    return "ServerType"
  };
  hashCode__I() {
    return 167556413
  };
  productIterator__sc_Iterator() {
    return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
  };
  fromConfig__Llaughedelic_atom_ide_scala_ServerType() {
    const x1 = $objectToString($g.atom.config.get("ide-scala.serverType"));
    if ((x1 === "scalameta")) {
      return $m_Llaughedelic_atom_ide_scala_ServerType$Scalameta$()
    } else if ((x1 === "ensime")) {
      return $m_Llaughedelic_atom_ide_scala_ServerType$Ensime$()
    } else {
      throw new $c_s_MatchError().init___O(x1)
    }
  };
}
const $d_Llaughedelic_atom_ide_scala_ServerType$ = new $TypeData().initClass({
  Llaughedelic_atom_ide_scala_ServerType$: 0
}, false, "laughedelic.atom.ide.scala.ServerType$", {
  Llaughedelic_atom_ide_scala_ServerType$: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Llaughedelic_atom_ide_scala_ServerType$.prototype.$classData = $d_Llaughedelic_atom_ide_scala_ServerType$;
let $n_Llaughedelic_atom_ide_scala_ServerType$ = (void 0);
const $m_Llaughedelic_atom_ide_scala_ServerType$ = (function() {
  if ((!$n_Llaughedelic_atom_ide_scala_ServerType$)) {
    $n_Llaughedelic_atom_ide_scala_ServerType$ = new $c_Llaughedelic_atom_ide_scala_ServerType$().init___()
  };
  return $n_Llaughedelic_atom_ide_scala_ServerType$
});
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
const $is_jl_ClassCastException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_ClassCastException)))
});
const $isArrayOf_jl_ClassCastException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ClassCastException)))
});
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
class $c_jl_IllegalStateException extends $c_jl_RuntimeException {
  init___T(s) {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
    return this
  };
  init___T__jl_Throwable(s, e) {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, e);
    return this
  };
}
const $d_jl_IllegalStateException = new $TypeData().initClass({
  jl_IllegalStateException: 0
}, false, "java.lang.IllegalStateException", {
  jl_IllegalStateException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalStateException.prototype.$classData = $d_jl_IllegalStateException;
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
class $c_jl_JSConsoleBasedPrintStream$DummyOutputStream extends $c_Ljava_io_OutputStream {
  init___() {
    return this
  };
}
const $d_jl_JSConsoleBasedPrintStream$DummyOutputStream = new $TypeData().initClass({
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream$DummyOutputStream", {
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  jl_AutoCloseable: 1,
  Ljava_io_Flushable: 1
});
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.$classData = $d_jl_JSConsoleBasedPrintStream$DummyOutputStream;
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
  init___() {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
    return this
  };
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
  isDefined__Z() {
    return (!this.isEmpty__Z())
  };
}
class $c_s_PartialFunction$$anon$1 extends $c_O {
  constructor() {
    super();
    this.lift$1 = null
  };
  init___() {
    this.lift$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
      return (function(x$2) {
        return $m_s_None$()
      })
    })(this));
    return this
  };
  apply__O__O(v1) {
    this.apply__O__sr_Nothing$(v1)
  };
  toString__T() {
    return "<function1>"
  };
  isDefinedAt__O__Z(x) {
    return false
  };
  applyOrElse__O__F1__O(x, $default) {
    return $f_s_PartialFunction__applyOrElse__O__F1__O(this, x, $default)
  };
  apply__O__sr_Nothing$(x) {
    throw new $c_s_MatchError().init___O(x)
  };
}
const $d_s_PartialFunction$$anon$1 = new $TypeData().initClass({
  s_PartialFunction$$anon$1: 0
}, false, "scala.PartialFunction$$anon$1", {
  s_PartialFunction$$anon$1: 1,
  O: 1,
  s_PartialFunction: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_PartialFunction$$anon$1.prototype.$classData = $d_s_PartialFunction$$anon$1;
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
  equals__O__Z(x$1) {
    if ((this === x$1)) {
      return true
    } else if ($is_s_StringContext(x$1)) {
      const StringContext$1 = x$1;
      const x = this.parts$1;
      const x$2 = StringContext$1.parts$1;
      return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
    } else {
      return false
    }
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
const $is_s_StringContext = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_StringContext)))
});
const $isArrayOf_s_StringContext = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_StringContext)))
});
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
class $c_s_util_Try extends $c_O {
}
const $is_s_util_Try = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_Try)))
});
const $isArrayOf_s_util_Try = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_Try)))
});
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
const $f_sc_GenMapLike__equals__O__Z = (function($thiz, that) {
  if ($is_sc_GenMap(that)) {
    const x2 = that;
    return (($thiz === x2) || (($thiz.size__I() === x2.size__I()) && $f_sc_GenMapLike__liftedTree1$1__psc_GenMapLike__sc_GenMap__Z($thiz, x2)))
  } else {
    return false
  }
});
const $f_sc_GenMapLike__liftedTree1$1__psc_GenMapLike__sc_GenMap__Z = (function($thiz, x2$1) {
  try {
    const this$1 = $thiz.iterator__sc_Iterator();
    let res = true;
    while ((res && this$1.hasNext__Z())) {
      const arg1 = this$1.next__O();
      const x0$1 = arg1;
      if ((x0$1 === null)) {
        throw new $c_s_MatchError().init___O(x0$1)
      };
      const k = x0$1.$$und1$f;
      const v = x0$1.$$und2$f;
      const x1$2 = x2$1.get__O__s_Option(k);
      matchEnd6: {
        if ($is_s_Some(x1$2)) {
          const x2 = x1$2;
          const p3 = x2.value$2;
          if ($m_sr_BoxesRunTime$().equals__O__O__Z(v, p3)) {
            res = true;
            break matchEnd6
          }
        };
        res = false
      }
    };
    return res
  } catch (e) {
    if ($is_jl_ClassCastException(e)) {
      return false
    } else {
      throw e
    }
  }
});
const $f_sc_GenSeqLike__equals__O__Z = (function($thiz, that) {
  if ($is_sc_GenSeq(that)) {
    const x2 = that;
    return $thiz.sameElements__sc_GenIterable__Z(x2)
  } else {
    return false
  }
});
const $f_sc_GenSeqLike__isDefinedAt__I__Z = (function($thiz, idx) {
  return ((idx >= 0) && (idx < $thiz.length__I()))
});
const $is_sc_GenTraversable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversable)))
});
const $isArrayOf_sc_GenTraversable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversable)))
});
class $c_sc_Iterable$ extends $c_scg_GenTraversableFactory {
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    return this
  };
  newBuilder__scm_Builder() {
    $m_sci_Iterable$();
    return new $c_scm_ListBuffer().init___()
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
class $c_sc_Iterator$$anon$10 extends $c_sc_AbstractIterator {
  constructor() {
    super();
    this.$$outer$2 = null;
    this.f$1$2 = null
  };
  next__O() {
    return this.f$1$2.apply__O__O(this.$$outer$2.next__O())
  };
  init___sc_Iterator__F1($$outer, f$1) {
    if (($$outer === null)) {
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
    } else {
      this.$$outer$2 = $$outer
    };
    this.f$1$2 = f$1;
    return this
  };
  hasNext__Z() {
    return this.$$outer$2.hasNext__Z()
  };
}
const $d_sc_Iterator$$anon$10 = new $TypeData().initClass({
  sc_Iterator$$anon$10: 0
}, false, "scala.collection.Iterator$$anon$10", {
  sc_Iterator$$anon$10: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_Iterator$$anon$10.prototype.$classData = $d_sc_Iterator$$anon$10;
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
      const result = this.these$2.head__O();
      this.these$2 = this.these$2.tail__O();
      return result
    } else {
      return $m_sc_Iterator$().empty$1.next__O()
    }
  };
  toList__sci_List() {
    const xs = this.these$2.toList__sci_List();
    this.these$2 = this.these$2.take__I__O(0);
    return xs
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
  newBuilder__scm_Builder() {
    $m_sci_Traversable$();
    return new $c_scm_ListBuffer().init___()
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
  empty__sc_GenTraversable() {
    return this.emptyInstance__sci_Set()
  };
  newBuilder__scm_Builder() {
    return new $c_scm_SetBuilder().init___sc_Set(this.emptyInstance__sci_Set())
  };
}
class $c_sci_Iterable$ extends $c_scg_GenTraversableFactory {
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    return this
  };
  newBuilder__scm_Builder() {
    return new $c_scm_ListBuffer().init___()
  };
}
const $d_sci_Iterable$ = new $TypeData().initClass({
  sci_Iterable$: 0
}, false, "scala.collection.immutable.Iterable$", {
  sci_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Iterable$.prototype.$classData = $d_sci_Iterable$;
let $n_sci_Iterable$ = (void 0);
const $m_sci_Iterable$ = (function() {
  if ((!$n_sci_Iterable$)) {
    $n_sci_Iterable$ = new $c_sci_Iterable$().init___()
  };
  return $n_sci_Iterable$
});
class $c_sci_StreamIterator extends $c_sc_AbstractIterator {
  constructor() {
    super();
    this.these$2 = null
  };
  next__O() {
    if ($f_sc_Iterator__isEmpty__Z(this)) {
      return $m_sc_Iterator$().empty$1.next__O()
    } else {
      const cur = this.these$2.v__sci_Stream();
      const result = cur.head__O();
      this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, cur$1) {
        return (function() {
          return cur$1.tail__O()
        })
      })(this, cur)));
      return result
    }
  };
  toList__sci_List() {
    const this$1 = this.toStream__sci_Stream();
    const this$2 = $m_sci_List$();
    const cbf = this$2.ReusableCBFInstance$2;
    return $f_sc_TraversableLike__to__scg_CanBuildFrom__O(this$1, cbf)
  };
  init___sci_Stream(self) {
    this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, self$1) {
      return (function() {
        return self$1
      })
    })(this, self)));
    return this
  };
  hasNext__Z() {
    const this$1 = this.these$2.v__sci_Stream();
    return $f_sc_TraversableOnce__nonEmpty__Z(this$1)
  };
  toStream__sci_Stream() {
    const result = this.these$2.v__sci_Stream();
    this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
      return (function() {
        $m_sci_Stream$();
        return $m_sci_Stream$Empty$()
      })
    })(this)));
    return result
  };
}
const $d_sci_StreamIterator = new $TypeData().initClass({
  sci_StreamIterator: 0
}, false, "scala.collection.immutable.StreamIterator", {
  sci_StreamIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_StreamIterator.prototype.$classData = $d_sci_StreamIterator;
class $c_sci_Traversable$ extends $c_scg_GenTraversableFactory {
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    return this
  };
  newBuilder__scm_Builder() {
    return new $c_scm_ListBuffer().init___()
  };
}
const $d_sci_Traversable$ = new $TypeData().initClass({
  sci_Traversable$: 0
}, false, "scala.collection.immutable.Traversable$", {
  sci_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Traversable$.prototype.$classData = $d_sci_Traversable$;
let $n_sci_Traversable$ = (void 0);
const $m_sci_Traversable$ = (function() {
  if ((!$n_sci_Traversable$)) {
    $n_sci_Traversable$ = new $c_sci_Traversable$().init___()
  };
  return $n_sci_Traversable$
});
class $c_sci_TrieIterator extends $c_sc_AbstractIterator {
  constructor() {
    super();
    this.elems$2 = null;
    this.scala$collection$immutable$TrieIterator$$depth$f = 0;
    this.scala$collection$immutable$TrieIterator$$arrayStack$f = null;
    this.scala$collection$immutable$TrieIterator$$posStack$f = null;
    this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
    this.scala$collection$immutable$TrieIterator$$posD$f = 0;
    this.scala$collection$immutable$TrieIterator$$subIter$f = null
  };
  isContainer__p2__O__Z(x) {
    return ($is_sci_HashMap$HashMap1(x) || $is_sci_HashSet$HashSet1(x))
  };
  next__O() {
    if ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null)) {
      const el = this.scala$collection$immutable$TrieIterator$$subIter$f.next__O();
      if ((!this.scala$collection$immutable$TrieIterator$$subIter$f.hasNext__Z())) {
        this.scala$collection$immutable$TrieIterator$$subIter$f = null
      };
      return el
    } else {
      return this.next0__p2__Asci_Iterable__I__O(this.scala$collection$immutable$TrieIterator$$arrayD$f, this.scala$collection$immutable$TrieIterator$$posD$f)
    }
  };
  initPosStack__AI() {
    return $newArrayObject($d_I.getArrayOf(), [6])
  };
  hasNext__Z() {
    return ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null) || (this.scala$collection$immutable$TrieIterator$$depth$f >= 0))
  };
  next0__p2__Asci_Iterable__I__O(elems, i) {
    _next0: while (true) {
      if ((i === (((-1) + elems.u.length) | 0))) {
        this.scala$collection$immutable$TrieIterator$$depth$f = (((-1) + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
        if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
          this.scala$collection$immutable$TrieIterator$$arrayD$f = this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f];
          this.scala$collection$immutable$TrieIterator$$posD$f = this.scala$collection$immutable$TrieIterator$$posStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f];
          this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = null
        } else {
          this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
          this.scala$collection$immutable$TrieIterator$$posD$f = 0
        }
      } else {
        this.scala$collection$immutable$TrieIterator$$posD$f = ((1 + this.scala$collection$immutable$TrieIterator$$posD$f) | 0)
      };
      const m = elems.u[i];
      if (this.isContainer__p2__O__Z(m)) {
        return this.getElem__O__O(m)
      } else if (this.isTrie__p2__O__Z(m)) {
        if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
          this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = this.scala$collection$immutable$TrieIterator$$arrayD$f;
          this.scala$collection$immutable$TrieIterator$$posStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = this.scala$collection$immutable$TrieIterator$$posD$f
        };
        this.scala$collection$immutable$TrieIterator$$depth$f = ((1 + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
        this.scala$collection$immutable$TrieIterator$$arrayD$f = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
        this.scala$collection$immutable$TrieIterator$$posD$f = 0;
        const temp$elems = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
        elems = temp$elems;
        i = 0;
        continue _next0
      } else {
        this.scala$collection$immutable$TrieIterator$$subIter$f = m.iterator__sc_Iterator();
        return this.next__O()
      }
    }
  };
  getElems__p2__sci_Iterable__Asci_Iterable(x) {
    if ($is_sci_HashMap$HashTrieMap(x)) {
      const x2 = x;
      return x2.elems$6
    } else {
      if ((!$is_sci_HashSet$HashTrieSet(x))) {
        throw new $c_s_MatchError().init___O(x)
      };
      const x3 = x;
      return x3.elems$5
    }
  };
  init___Asci_Iterable(elems) {
    this.elems$2 = elems;
    this.scala$collection$immutable$TrieIterator$$depth$f = 0;
    this.scala$collection$immutable$TrieIterator$$arrayStack$f = this.initArrayStack__AAsci_Iterable();
    this.scala$collection$immutable$TrieIterator$$posStack$f = this.initPosStack__AI();
    this.scala$collection$immutable$TrieIterator$$arrayD$f = this.elems$2;
    this.scala$collection$immutable$TrieIterator$$posD$f = 0;
    this.scala$collection$immutable$TrieIterator$$subIter$f = null;
    return this
  };
  isTrie__p2__O__Z(x) {
    return ($is_sci_HashMap$HashTrieMap(x) || $is_sci_HashSet$HashTrieSet(x))
  };
  initArrayStack__AAsci_Iterable() {
    return $newArrayObject($d_sci_Iterable.getArrayOf().getArrayOf(), [6])
  };
}
class $c_sci_Vector$$anon$1 extends $c_sc_AbstractIterator {
  constructor() {
    super();
    this.i$2 = 0;
    this.$$outer$2 = null
  };
  next__O() {
    if ((this.i$2 > 0)) {
      this.i$2 = (((-1) + this.i$2) | 0);
      return this.$$outer$2.apply__I__O(this.i$2)
    } else {
      return $m_sc_Iterator$().empty$1.next__O()
    }
  };
  hasNext__Z() {
    return (this.i$2 > 0)
  };
  init___sci_Vector($$outer) {
    if (($$outer === null)) {
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
    } else {
      this.$$outer$2 = $$outer
    };
    this.i$2 = $$outer.length__I();
    return this
  };
}
const $d_sci_Vector$$anon$1 = new $TypeData().initClass({
  sci_Vector$$anon$1: 0
}, false, "scala.collection.immutable.Vector$$anon$1", {
  sci_Vector$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_Vector$$anon$1.prototype.$classData = $d_sci_Vector$$anon$1;
class $c_scm_Builder$$anon$1 extends $c_O {
  constructor() {
    super();
    this.self$1 = null;
    this.f$1$1 = null
  };
  init___scm_Builder__F1($$outer, f$1) {
    this.f$1$1 = f$1;
    this.self$1 = $$outer;
    return this
  };
  equals__O__Z(that) {
    return $f_s_Proxy__equals__O__Z(this, that)
  };
  $$plus$eq__O__scg_Growable(elem) {
    return this.$$plus$eq__O__scm_Builder$$anon$1(elem)
  };
  toString__T() {
    return $f_s_Proxy__toString__T(this)
  };
  $$plus$plus$eq__sc_TraversableOnce__scm_Builder$$anon$1(xs) {
    this.self$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs);
    return this
  };
  result__O() {
    return this.f$1$1.apply__O__O(this.self$1.result__O())
  };
  sizeHintBounded__I__sc_TraversableLike__V(size, boundColl) {
    this.self$1.sizeHintBounded__I__sc_TraversableLike__V(size, boundColl)
  };
  $$plus$eq__O__scm_Builder(elem) {
    return this.$$plus$eq__O__scm_Builder$$anon$1(elem)
  };
  $$plus$eq__O__scm_Builder$$anon$1(x) {
    this.self$1.$$plus$eq__O__scm_Builder(x);
    return this
  };
  hashCode__I() {
    return this.self$1.hashCode__I()
  };
  sizeHint__I__V(size) {
    this.self$1.sizeHint__I__V(size)
  };
  $$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs) {
    return this.$$plus$plus$eq__sc_TraversableOnce__scm_Builder$$anon$1(xs)
  };
}
const $d_scm_Builder$$anon$1 = new $TypeData().initClass({
  scm_Builder$$anon$1: 0
}, false, "scala.collection.mutable.Builder$$anon$1", {
  scm_Builder$$anon$1: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Proxy: 1
});
$c_scm_Builder$$anon$1.prototype.$classData = $d_scm_Builder$$anon$1;
class $c_scm_LazyBuilder extends $c_O {
  constructor() {
    super();
    this.parts$1 = null
  };
  init___() {
    this.parts$1 = new $c_scm_ListBuffer().init___();
    return this
  };
  $$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder(xs) {
    this.parts$1.$$plus$eq__O__scm_ListBuffer(xs);
    return this
  };
  $$plus$eq__O__scg_Growable(elem) {
    return this.$$plus$eq__O__scm_LazyBuilder(elem)
  };
  $$plus$eq__O__scm_LazyBuilder(x) {
    const jsx$1 = this.parts$1;
    $m_sci_List$();
    const xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([x]);
    const this$2 = $m_sci_List$();
    const cbf = this$2.ReusableCBFInstance$2;
    jsx$1.$$plus$eq__O__scm_ListBuffer($f_sc_TraversableLike__to__scg_CanBuildFrom__O(xs, cbf));
    return this
  };
  sizeHintBounded__I__sc_TraversableLike__V(size, boundingColl) {
    $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
  };
  $$plus$eq__O__scm_Builder(elem) {
    return this.$$plus$eq__O__scm_LazyBuilder(elem)
  };
  sizeHint__I__V(size) {
    /*<skip>*/
  };
  $$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs) {
    return this.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder(xs)
  };
}
class $c_scm_ListBuffer$$anon$1 extends $c_sc_AbstractIterator {
  constructor() {
    super();
    this.cursor$2 = null
  };
  init___scm_ListBuffer($$outer) {
    this.cursor$2 = ($$outer.isEmpty__Z() ? $m_sci_Nil$() : $$outer.scala$collection$mutable$ListBuffer$$start$6);
    return this
  };
  next__O() {
    if ((!this.hasNext__Z())) {
      throw new $c_ju_NoSuchElementException().init___T("next on empty Iterator")
    } else {
      const ans = this.cursor$2.head__O();
      const this$1 = this.cursor$2;
      this.cursor$2 = this$1.tail__sci_List();
      return ans
    }
  };
  hasNext__Z() {
    return (this.cursor$2 !== $m_sci_Nil$())
  };
}
const $d_scm_ListBuffer$$anon$1 = new $TypeData().initClass({
  scm_ListBuffer$$anon$1: 0
}, false, "scala.collection.mutable.ListBuffer$$anon$1", {
  scm_ListBuffer$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_scm_ListBuffer$$anon$1.prototype.$classData = $d_scm_ListBuffer$$anon$1;
class $c_scm_MapBuilder extends $c_O {
  constructor() {
    super();
    this.empty$1 = null;
    this.elems$1 = null
  };
  $$plus$eq__T2__scm_MapBuilder(x) {
    this.elems$1 = this.elems$1.$$plus__T2__sc_GenMap(x);
    return this
  };
  $$plus$eq__O__scg_Growable(elem) {
    return this.$$plus$eq__T2__scm_MapBuilder(elem)
  };
  result__O() {
    return this.elems$1
  };
  sizeHintBounded__I__sc_TraversableLike__V(size, boundingColl) {
    $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
  };
  init___sc_GenMap(empty) {
    this.empty$1 = empty;
    this.elems$1 = empty;
    return this
  };
  $$plus$eq__O__scm_Builder(elem) {
    return this.$$plus$eq__T2__scm_MapBuilder(elem)
  };
  sizeHint__I__V(size) {
    /*<skip>*/
  };
  $$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs) {
    return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
  };
}
const $d_scm_MapBuilder = new $TypeData().initClass({
  scm_MapBuilder: 0
}, false, "scala.collection.mutable.MapBuilder", {
  scm_MapBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_MapBuilder.prototype.$classData = $d_scm_MapBuilder;
class $c_scm_SetBuilder extends $c_O {
  constructor() {
    super();
    this.empty$1 = null;
    this.elems$1 = null
  };
  $$plus$eq__O__scg_Growable(elem) {
    return this.$$plus$eq__O__scm_SetBuilder(elem)
  };
  result__O() {
    return this.elems$1
  };
  sizeHintBounded__I__sc_TraversableLike__V(size, boundingColl) {
    $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
  };
  $$plus$eq__O__scm_SetBuilder(x) {
    this.elems$1 = this.elems$1.$$plus__O__sc_Set(x);
    return this
  };
  init___sc_Set(empty) {
    this.empty$1 = empty;
    this.elems$1 = empty;
    return this
  };
  $$plus$eq__O__scm_Builder(elem) {
    return this.$$plus$eq__O__scm_SetBuilder(elem)
  };
  sizeHint__I__V(size) {
    /*<skip>*/
  };
  $$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs) {
    return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
  };
}
const $d_scm_SetBuilder = new $TypeData().initClass({
  scm_SetBuilder: 0
}, false, "scala.collection.mutable.SetBuilder", {
  scm_SetBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_SetBuilder.prototype.$classData = $d_scm_SetBuilder;
const $is_sr_NonLocalReturnControl = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sr_NonLocalReturnControl)))
});
const $isArrayOf_sr_NonLocalReturnControl = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_NonLocalReturnControl)))
});
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
class $c_Llaughedelic_atom_ide_scala_ServerType$Ensime$ extends $c_O {
  constructor() {
    super();
    this.name$1 = null
  };
  init___() {
    this.name$1 = "ENSIME";
    return this
  };
  productPrefix__T() {
    return "Ensime"
  };
  productArity__I() {
    return 0
  };
  javaArgs__T__sc_Seq(projectPath) {
    return $m_sc_Seq$().apply__sc_Seq__sc_GenTraversable(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["-Xmx4G", new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["-Dlsp.workspace=", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([projectPath])), new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["-Dlsp.logLevel=DEBUG"])).s__sc_Seq__T($m_sci_Nil$())]))
  };
  productElement__I__O(x$1) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
  };
  toString__T() {
    return "Ensime"
  };
  name__T() {
    return this.name$1
  };
  coursierArgs__T__sc_Seq(version) {
    return $m_sc_Seq$().apply__sc_Seq__sc_GenTraversable(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["--repository", "bintray:dhpcs/maven", "--repository", "sonatype:snapshots", new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["org.ensime:server_2.12:", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([version])), "--main", "org.ensime.server.Server", "--", "--lsp"]))
  };
  hashCode__I() {
    return 2080529079
  };
  watchFilter__T__Z(filePath) {
    return ((filePath.indexOf(".ensime") | 0) !== (-1))
  };
  productIterator__sc_Iterator() {
    return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
  };
}
const $d_Llaughedelic_atom_ide_scala_ServerType$Ensime$ = new $TypeData().initClass({
  Llaughedelic_atom_ide_scala_ServerType$Ensime$: 0
}, false, "laughedelic.atom.ide.scala.ServerType$Ensime$", {
  Llaughedelic_atom_ide_scala_ServerType$Ensime$: 1,
  O: 1,
  Llaughedelic_atom_ide_scala_ServerType: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Llaughedelic_atom_ide_scala_ServerType$Ensime$.prototype.$classData = $d_Llaughedelic_atom_ide_scala_ServerType$Ensime$;
let $n_Llaughedelic_atom_ide_scala_ServerType$Ensime$ = (void 0);
const $m_Llaughedelic_atom_ide_scala_ServerType$Ensime$ = (function() {
  if ((!$n_Llaughedelic_atom_ide_scala_ServerType$Ensime$)) {
    $n_Llaughedelic_atom_ide_scala_ServerType$Ensime$ = new $c_Llaughedelic_atom_ide_scala_ServerType$Ensime$().init___()
  };
  return $n_Llaughedelic_atom_ide_scala_ServerType$Ensime$
});
class $c_Llaughedelic_atom_ide_scala_ServerType$Scalameta$ extends $c_O {
  constructor() {
    super();
    this.name$1 = null
  };
  init___() {
    this.name$1 = "Scalameta";
    return this
  };
  productPrefix__T() {
    return "Scalameta"
  };
  productArity__I() {
    return 0
  };
  javaArgs__T__sc_Seq(projectPath) {
    return $m_sc_Seq$().apply__sc_Seq__sc_GenTraversable($m_sci_Nil$())
  };
  productElement__I__O(x$1) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
  };
  toString__T() {
    return "Scalameta"
  };
  name__T() {
    return this.name$1
  };
  coursierArgs__T__sc_Seq(version) {
    return $m_sc_Seq$().apply__sc_Seq__sc_GenTraversable(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["--repository", "bintray:dhpcs/maven", "--repository", "bintray:scalameta/maven", new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["org.scalameta:metaserver_2.12:", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([version])), "--main", "scala.meta.languageserver.Main"]))
  };
  hashCode__I() {
    return 123087915
  };
  watchFilter__T__Z(filePath) {
    return ($m_sjsr_RuntimeString$().endsWith__T__T__Z(filePath, ".semanticdb") || $m_sjsr_RuntimeString$().endsWith__T__T__Z(filePath, ".compilerconfig"))
  };
  productIterator__sc_Iterator() {
    return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
  };
}
const $d_Llaughedelic_atom_ide_scala_ServerType$Scalameta$ = new $TypeData().initClass({
  Llaughedelic_atom_ide_scala_ServerType$Scalameta$: 0
}, false, "laughedelic.atom.ide.scala.ServerType$Scalameta$", {
  Llaughedelic_atom_ide_scala_ServerType$Scalameta$: 1,
  O: 1,
  Llaughedelic_atom_ide_scala_ServerType: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Llaughedelic_atom_ide_scala_ServerType$Scalameta$.prototype.$classData = $d_Llaughedelic_atom_ide_scala_ServerType$Scalameta$;
let $n_Llaughedelic_atom_ide_scala_ServerType$Scalameta$ = (void 0);
const $m_Llaughedelic_atom_ide_scala_ServerType$Scalameta$ = (function() {
  if ((!$n_Llaughedelic_atom_ide_scala_ServerType$Scalameta$)) {
    $n_Llaughedelic_atom_ide_scala_ServerType$Scalameta$ = new $c_Llaughedelic_atom_ide_scala_ServerType$Scalameta$().init___()
  };
  return $n_Llaughedelic_atom_ide_scala_ServerType$Scalameta$
});
class $c_T2 extends $c_O {
  constructor() {
    super();
    this.$$und1$f = null;
    this.$$und2$f = null
  };
  productPrefix__T() {
    return "Tuple2"
  };
  productArity__I() {
    return 2
  };
  equals__O__Z(x$1) {
    if ((this === x$1)) {
      return true
    } else if ($is_T2(x$1)) {
      const Tuple2$1 = x$1;
      return ($m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und1$f, Tuple2$1.$$und1$f) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und2$f, Tuple2$1.$$und2$f))
    } else {
      return false
    }
  };
  init___O__O(_1, _2) {
    this.$$und1$f = _1;
    this.$$und2$f = _2;
    return this
  };
  productElement__I__O(n) {
    return $f_s_Product2__productElement__I__O(this, n)
  };
  toString__T() {
    return (((("(" + this.$$und1$f) + ",") + this.$$und2$f) + ")")
  };
  hashCode__I() {
    const this$2 = $m_s_util_hashing_MurmurHash3$();
    return this$2.productHash__s_Product__I__I(this, (-889275714))
  };
  productIterator__sc_Iterator() {
    return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
  };
}
const $is_T2 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.T2)))
});
const $isArrayOf_T2 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T2)))
});
const $d_T2 = new $TypeData().initClass({
  T2: 0
}, false, "scala.Tuple2", {
  T2: 1,
  O: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_T2.prototype.$classData = $d_T2;
class $c_jl_NumberFormatException extends $c_jl_IllegalArgumentException {
  init___T(s) {
    $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
    return this
  };
}
const $d_jl_NumberFormatException = new $TypeData().initClass({
  jl_NumberFormatException: 0
}, false, "java.lang.NumberFormatException", {
  jl_NumberFormatException: 1,
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NumberFormatException.prototype.$classData = $d_jl_NumberFormatException;
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
  isEmpty__Z() {
    return true
  };
  get__O() {
    this.get__sr_Nothing$()
  };
  productElement__I__O(x$1) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
  };
  toString__T() {
    return "None"
  };
  get__sr_Nothing$() {
    throw new $c_ju_NoSuchElementException().init___T("None.get")
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
class $c_s_PartialFunction$$anonfun$1 extends $c_sr_AbstractPartialFunction {
  init___() {
    return this
  };
  isDefinedAt__O__Z(x1) {
    return true
  };
  applyOrElse__O__F1__O(x1, $default) {
    return $m_s_PartialFunction$().scala$PartialFunction$$fallback$undpf$f
  };
}
const $d_s_PartialFunction$$anonfun$1 = new $TypeData().initClass({
  s_PartialFunction$$anonfun$1: 0
}, false, "scala.PartialFunction$$anonfun$1", {
  s_PartialFunction$$anonfun$1: 1,
  sr_AbstractPartialFunction: 1,
  O: 1,
  F1: 1,
  s_PartialFunction: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_PartialFunction$$anonfun$1.prototype.$classData = $d_s_PartialFunction$$anonfun$1;
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
  equals__O__Z(x$1) {
    if ((this === x$1)) {
      return true
    } else if ($is_s_Some(x$1)) {
      const Some$1 = x$1;
      return $m_sr_BoxesRunTime$().equals__O__O__Z(this.value$2, Some$1.value$2)
    } else {
      return false
    }
  };
  isEmpty__Z() {
    return false
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
  get__O() {
    return this.value$2
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
class $c_s_concurrent_Future$$anonfun$fallbackTo$1 extends $c_sr_AbstractPartialFunction {
  constructor() {
    super();
    this.that$3$2 = null
  };
  isDefinedAt__jl_Throwable__Z(x1) {
    return true
  };
  applyOrElse__jl_Throwable__F1__O(x1, $default) {
    return this.that$3$2
  };
  isDefinedAt__O__Z(x) {
    return this.isDefinedAt__jl_Throwable__Z(x)
  };
  applyOrElse__O__F1__O(x, $default) {
    return this.applyOrElse__jl_Throwable__F1__O(x, $default)
  };
  init___s_concurrent_Future__s_concurrent_Future($$outer, that$3) {
    this.that$3$2 = that$3;
    return this
  };
}
const $d_s_concurrent_Future$$anonfun$fallbackTo$1 = new $TypeData().initClass({
  s_concurrent_Future$$anonfun$fallbackTo$1: 0
}, false, "scala.concurrent.Future$$anonfun$fallbackTo$1", {
  s_concurrent_Future$$anonfun$fallbackTo$1: 1,
  sr_AbstractPartialFunction: 1,
  O: 1,
  F1: 1,
  s_PartialFunction: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_concurrent_Future$$anonfun$fallbackTo$1.prototype.$classData = $d_s_concurrent_Future$$anonfun$fallbackTo$1;
class $c_s_concurrent_Future$$anonfun$fallbackTo$2 extends $c_sr_AbstractPartialFunction {
  constructor() {
    super();
    this.$$outer$2 = null
  };
  isDefinedAt__jl_Throwable__Z(x2) {
    return true
  };
  applyOrElse__jl_Throwable__F1__O(x2, $default) {
    return this.$$outer$2
  };
  init___s_concurrent_Future($$outer) {
    if (($$outer === null)) {
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
    } else {
      this.$$outer$2 = $$outer
    };
    return this
  };
  isDefinedAt__O__Z(x) {
    return this.isDefinedAt__jl_Throwable__Z(x)
  };
  applyOrElse__O__F1__O(x, $default) {
    return this.applyOrElse__jl_Throwable__F1__O(x, $default)
  };
}
const $d_s_concurrent_Future$$anonfun$fallbackTo$2 = new $TypeData().initClass({
  s_concurrent_Future$$anonfun$fallbackTo$2: 0
}, false, "scala.concurrent.Future$$anonfun$fallbackTo$2", {
  s_concurrent_Future$$anonfun$fallbackTo$2: 1,
  sr_AbstractPartialFunction: 1,
  O: 1,
  F1: 1,
  s_PartialFunction: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_concurrent_Future$$anonfun$fallbackTo$2.prototype.$classData = $d_s_concurrent_Future$$anonfun$fallbackTo$2;
class $c_s_concurrent_impl_Promise$KeptPromise$Failed extends $c_O {
  constructor() {
    super();
    this.result$1 = null
  };
  init___s_util_Failure(result) {
    this.result$1 = result;
    return this
  };
  tryComplete__s_util_Try__Z(value) {
    return false
  };
  toString__T() {
    return $f_s_concurrent_impl_Promise__toString__T(this)
  };
  fallbackTo__s_concurrent_Future__s_concurrent_Future(that) {
    return ((this === that) ? this : that.recoverWith__s_PartialFunction__s_concurrent_ExecutionContext__s_concurrent_Future(new $c_s_concurrent_impl_Promise$KeptPromise$Failed$$anonfun$fallbackTo$1().init___s_concurrent_impl_Promise$KeptPromise$Failed(this), $m_s_concurrent_Future$InternalCallbackExecutor$()))
  };
  onComplete__F1__s_concurrent_ExecutionContext__V(func, executor) {
    $f_s_concurrent_impl_Promise$KeptPromise$Kept__onComplete__F1__s_concurrent_ExecutionContext__V(this, func, executor)
  };
  value__s_Option() {
    return new $c_s_Some().init___O(this.result$1)
  };
  map__F1__s_concurrent_ExecutionContext__s_concurrent_Future(f, executor) {
    return this
  };
  filter__F1__s_concurrent_ExecutionContext__s_concurrent_Future(p, executor) {
    return this
  };
  recoverWith__s_PartialFunction__s_concurrent_ExecutionContext__s_concurrent_Future(pf, executor) {
    return $f_s_concurrent_Future__recoverWith__s_PartialFunction__s_concurrent_ExecutionContext__s_concurrent_Future(this, pf, executor)
  };
  result__s_util_Try() {
    return this.result$1
  };
}
const $d_s_concurrent_impl_Promise$KeptPromise$Failed = new $TypeData().initClass({
  s_concurrent_impl_Promise$KeptPromise$Failed: 0
}, false, "scala.concurrent.impl.Promise$KeptPromise$Failed", {
  s_concurrent_impl_Promise$KeptPromise$Failed: 1,
  O: 1,
  s_concurrent_impl_Promise$KeptPromise$Kept: 1,
  s_concurrent_impl_Promise: 1,
  s_concurrent_Promise: 1,
  s_concurrent_Future: 1,
  s_concurrent_Awaitable: 1
});
$c_s_concurrent_impl_Promise$KeptPromise$Failed.prototype.$classData = $d_s_concurrent_impl_Promise$KeptPromise$Failed;
class $c_s_concurrent_impl_Promise$KeptPromise$Failed$$anonfun$fallbackTo$1 extends $c_sr_AbstractPartialFunction {
  constructor() {
    super();
    this.$$outer$2 = null
  };
  isDefinedAt__jl_Throwable__Z(x1) {
    return true
  };
  applyOrElse__jl_Throwable__F1__O(x1, $default) {
    return this.$$outer$2
  };
  isDefinedAt__O__Z(x) {
    return this.isDefinedAt__jl_Throwable__Z(x)
  };
  applyOrElse__O__F1__O(x, $default) {
    return this.applyOrElse__jl_Throwable__F1__O(x, $default)
  };
  init___s_concurrent_impl_Promise$KeptPromise$Failed($$outer) {
    if (($$outer === null)) {
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
    } else {
      this.$$outer$2 = $$outer
    };
    return this
  };
}
const $d_s_concurrent_impl_Promise$KeptPromise$Failed$$anonfun$fallbackTo$1 = new $TypeData().initClass({
  s_concurrent_impl_Promise$KeptPromise$Failed$$anonfun$fallbackTo$1: 0
}, false, "scala.concurrent.impl.Promise$KeptPromise$Failed$$anonfun$fallbackTo$1", {
  s_concurrent_impl_Promise$KeptPromise$Failed$$anonfun$fallbackTo$1: 1,
  sr_AbstractPartialFunction: 1,
  O: 1,
  F1: 1,
  s_PartialFunction: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_concurrent_impl_Promise$KeptPromise$Failed$$anonfun$fallbackTo$1.prototype.$classData = $d_s_concurrent_impl_Promise$KeptPromise$Failed$$anonfun$fallbackTo$1;
class $c_s_concurrent_impl_Promise$KeptPromise$Successful extends $c_O {
  constructor() {
    super();
    this.result$1 = null
  };
  tryComplete__s_util_Try__Z(value) {
    return false
  };
  toString__T() {
    return $f_s_concurrent_impl_Promise__toString__T(this)
  };
  fallbackTo__s_concurrent_Future__s_concurrent_Future(that) {
    return this
  };
  init___s_util_Success(result) {
    this.result$1 = result;
    return this
  };
  onComplete__F1__s_concurrent_ExecutionContext__V(func, executor) {
    $f_s_concurrent_impl_Promise$KeptPromise$Kept__onComplete__F1__s_concurrent_ExecutionContext__V(this, func, executor)
  };
  map__F1__s_concurrent_ExecutionContext__s_concurrent_Future(f, executor) {
    return $f_s_concurrent_Future__map__F1__s_concurrent_ExecutionContext__s_concurrent_Future(this, f, executor)
  };
  value__s_Option() {
    return new $c_s_Some().init___O(this.result$1)
  };
  filter__F1__s_concurrent_ExecutionContext__s_concurrent_Future(p, executor) {
    return $f_s_concurrent_Future__filter__F1__s_concurrent_ExecutionContext__s_concurrent_Future(this, p, executor)
  };
  recoverWith__s_PartialFunction__s_concurrent_ExecutionContext__s_concurrent_Future(pf, executor) {
    return this
  };
  result__s_util_Try() {
    return this.result$1
  };
}
const $d_s_concurrent_impl_Promise$KeptPromise$Successful = new $TypeData().initClass({
  s_concurrent_impl_Promise$KeptPromise$Successful: 0
}, false, "scala.concurrent.impl.Promise$KeptPromise$Successful", {
  s_concurrent_impl_Promise$KeptPromise$Successful: 1,
  O: 1,
  s_concurrent_impl_Promise$KeptPromise$Kept: 1,
  s_concurrent_impl_Promise: 1,
  s_concurrent_Promise: 1,
  s_concurrent_Future: 1,
  s_concurrent_Awaitable: 1
});
$c_s_concurrent_impl_Promise$KeptPromise$Successful.prototype.$classData = $d_s_concurrent_impl_Promise$KeptPromise$Successful;
class $c_s_util_Failure extends $c_s_util_Try {
  constructor() {
    super();
    this.exception$2 = null
  };
  productPrefix__T() {
    return "Failure"
  };
  productArity__I() {
    return 1
  };
  equals__O__Z(x$1) {
    if ((this === x$1)) {
      return true
    } else if ($is_s_util_Failure(x$1)) {
      const Failure$1 = x$1;
      const x = this.exception$2;
      const x$2 = Failure$1.exception$2;
      return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
    } else {
      return false
    }
  };
  map__F1__s_util_Try(f) {
    return this
  };
  productElement__I__O(x$1) {
    switch (x$1) {
      case 0: {
        return this.exception$2;
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
  init___jl_Throwable(exception) {
    this.exception$2 = exception;
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
const $is_s_util_Failure = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_Failure)))
});
const $isArrayOf_s_util_Failure = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_Failure)))
});
const $d_s_util_Failure = new $TypeData().initClass({
  s_util_Failure: 0
}, false, "scala.util.Failure", {
  s_util_Failure: 1,
  s_util_Try: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Failure.prototype.$classData = $d_s_util_Failure;
class $c_s_util_Success extends $c_s_util_Try {
  constructor() {
    super();
    this.value$2 = null
  };
  productPrefix__T() {
    return "Success"
  };
  productArity__I() {
    return 1
  };
  equals__O__Z(x$1) {
    if ((this === x$1)) {
      return true
    } else if ($is_s_util_Success(x$1)) {
      const Success$1 = x$1;
      return $m_sr_BoxesRunTime$().equals__O__O__Z(this.value$2, Success$1.value$2)
    } else {
      return false
    }
  };
  map__F1__s_util_Try(f) {
    try {
      return new $c_s_util_Success().init___O(f.apply__O__O(this.value$2))
    } catch (e) {
      const e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        const o11 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2);
        if ((!o11.isEmpty__Z())) {
          const e$3 = o11.get__O();
          return new $c_s_util_Failure().init___jl_Throwable(e$3)
        };
        throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
      } else {
        throw e
      }
    }
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
const $is_s_util_Success = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_Success)))
});
const $isArrayOf_s_util_Success = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_Success)))
});
const $d_s_util_Success = new $TypeData().initClass({
  s_util_Success: 0
}, false, "scala.util.Success", {
  s_util_Success: 1,
  s_util_Try: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Success.prototype.$classData = $d_s_util_Success;
const $f_sc_GenSetLike__equals__O__Z = (function($thiz, that) {
  if ($is_sc_GenSet(that)) {
    const x2 = that;
    return (($thiz === x2) || (($thiz.size__I() === x2.size__I()) && $f_sc_GenSetLike__liftedTree1$1__psc_GenSetLike__sc_GenSet__Z($thiz, x2)))
  } else {
    return false
  }
});
const $f_sc_GenSetLike__liftedTree1$1__psc_GenSetLike__sc_GenSet__Z = (function($thiz, x2$1) {
  try {
    return $thiz.subsetOf__sc_GenSet__Z(x2$1)
  } catch (e) {
    if ($is_jl_ClassCastException(e)) {
      return false
    } else {
      throw e
    }
  }
});
const $f_sc_TraversableLike__flatMap__F1__scg_CanBuildFrom__O = (function($thiz, f, bf) {
  const b = bf.apply__O__scm_Builder($thiz.repr__O());
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, f$1, b$1) {
    return (function(x$2) {
      return b$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(f$1.apply__O__O(x$2).seq__sc_TraversableOnce())
    })
  })($thiz, f, b)));
  return b.result__O()
});
const $f_sc_TraversableLike__to__scg_CanBuildFrom__O = (function($thiz, cbf) {
  const b = cbf.apply__scm_Builder();
  $f_scm_Builder__sizeHint__sc_TraversableLike__V(b, $thiz);
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz.thisCollection__sc_Traversable());
  return b.result__O()
});
const $f_sc_TraversableLike__isPartLikelySynthetic$1__psc_TraversableLike__T__I__Z = (function($thiz, fqn$1, partStart$1) {
  const firstChar = (65535 & (fqn$1.charCodeAt(partStart$1) | 0));
  return (((firstChar > 90) && (firstChar < 127)) || (firstChar < 65))
});
const $f_sc_TraversableLike__toString__T = (function($thiz) {
  return $thiz.mkString__T__T__T__T(($thiz.stringPrefix__T() + "("), ", ", ")")
});
const $f_sc_TraversableLike__$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O = (function($thiz, that, bf) {
  const b = bf.apply__O__scm_Builder($thiz.repr__O());
  if ($is_sc_IndexedSeqLike(that)) {
    const delta = that.seq__sc_TraversableOnce().size__I();
    $f_scm_Builder__sizeHint__sc_TraversableLike__I__V(b, $thiz, delta)
  };
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz.thisCollection__sc_Traversable());
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(that.seq__sc_TraversableOnce());
  return b.result__O()
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
const $is_sc_TraversableLike = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_TraversableLike)))
});
const $isArrayOf_sc_TraversableLike = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_TraversableLike)))
});
class $c_scg_SeqFactory extends $c_scg_GenSeqFactory {
}
class $c_sci_HashMap$HashTrieMap$$anon$1 extends $c_sci_TrieIterator {
  init___sci_HashMap$HashTrieMap($$outer) {
    $c_sci_TrieIterator.prototype.init___Asci_Iterable.call(this, $$outer.elems$6);
    return this
  };
  getElem__O__O(x) {
    return x.ensurePair__T2()
  };
}
const $d_sci_HashMap$HashTrieMap$$anon$1 = new $TypeData().initClass({
  sci_HashMap$HashTrieMap$$anon$1: 0
}, false, "scala.collection.immutable.HashMap$HashTrieMap$$anon$1", {
  sci_HashMap$HashTrieMap$$anon$1: 1,
  sci_TrieIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_HashMap$HashTrieMap$$anon$1.prototype.$classData = $d_sci_HashMap$HashTrieMap$$anon$1;
class $c_sci_HashSet$HashTrieSet$$anon$1 extends $c_sci_TrieIterator {
  init___sci_HashSet$HashTrieSet($$outer) {
    $c_sci_TrieIterator.prototype.init___Asci_Iterable.call(this, $$outer.elems$5);
    return this
  };
  getElem__O__O(cc) {
    return cc.key$6
  };
}
const $d_sci_HashSet$HashTrieSet$$anon$1 = new $TypeData().initClass({
  sci_HashSet$HashTrieSet$$anon$1: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet$$anon$1", {
  sci_HashSet$HashTrieSet$$anon$1: 1,
  sci_TrieIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.$classData = $d_sci_HashSet$HashTrieSet$$anon$1;
class $c_sci_Set$ extends $c_scg_ImmutableSetFactory {
  init___() {
    return this
  };
  emptyInstance__sci_Set() {
    return $m_sci_Set$EmptySet$()
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
class $c_sci_Stream$StreamBuilder extends $c_scm_LazyBuilder {
  init___() {
    $c_scm_LazyBuilder.prototype.init___.call(this);
    return this
  };
  result__O() {
    return this.result__sci_Stream()
  };
  result__sci_Stream() {
    const this$1 = this.parts$1;
    return this$1.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream().flatMap__F1__scg_CanBuildFrom__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
      return (function(x$5$2) {
        const x$5 = x$5$2;
        return x$5.toStream__sci_Stream()
      })
    })(this)), ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___()))
  };
}
const $is_sci_Stream$StreamBuilder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream$StreamBuilder)))
});
const $isArrayOf_sci_Stream$StreamBuilder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream$StreamBuilder)))
});
const $d_sci_Stream$StreamBuilder = new $TypeData().initClass({
  sci_Stream$StreamBuilder: 0
}, false, "scala.collection.immutable.Stream$StreamBuilder", {
  sci_Stream$StreamBuilder: 1,
  scm_LazyBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_sci_Stream$StreamBuilder.prototype.$classData = $d_sci_Stream$StreamBuilder;
class $c_sci_VectorBuilder extends $c_O {
  constructor() {
    super();
    this.blockIndex$1 = 0;
    this.lo$1 = 0;
    this.depth$1 = 0;
    this.display0$1 = null;
    this.display1$1 = null;
    this.display2$1 = null;
    this.display3$1 = null;
    this.display4$1 = null;
    this.display5$1 = null
  };
  display3__AO() {
    return this.display3$1
  };
  init___() {
    this.display0$1 = $newArrayObject($d_O.getArrayOf(), [32]);
    this.depth$1 = 1;
    this.blockIndex$1 = 0;
    this.lo$1 = 0;
    return this
  };
  depth__I() {
    return this.depth$1
  };
  $$plus$eq__O__scg_Growable(elem) {
    return this.$$plus$eq__O__sci_VectorBuilder(elem)
  };
  display5$und$eq__AO__V(x$1) {
    this.display5$1 = x$1
  };
  display0__AO() {
    return this.display0$1
  };
  display2$und$eq__AO__V(x$1) {
    this.display2$1 = x$1
  };
  display4__AO() {
    return this.display4$1
  };
  $$plus$eq__O__sci_VectorBuilder(elem) {
    if ((this.lo$1 >= this.display0$1.u.length)) {
      const newBlockIndex = ((32 + this.blockIndex$1) | 0);
      const xor = (this.blockIndex$1 ^ newBlockIndex);
      $f_sci_VectorPointer__gotoNextBlockStartWritable__I__I__V(this, newBlockIndex, xor);
      this.blockIndex$1 = newBlockIndex;
      this.lo$1 = 0
    };
    this.display0$1.u[this.lo$1] = elem;
    this.lo$1 = ((1 + this.lo$1) | 0);
    return this
  };
  result__O() {
    return this.result__sci_Vector()
  };
  sizeHintBounded__I__sc_TraversableLike__V(size, boundingColl) {
    $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
  };
  display1$und$eq__AO__V(x$1) {
    this.display1$1 = x$1
  };
  display4$und$eq__AO__V(x$1) {
    this.display4$1 = x$1
  };
  display1__AO() {
    return this.display1$1
  };
  display5__AO() {
    return this.display5$1
  };
  result__sci_Vector() {
    const size = ((this.blockIndex$1 + this.lo$1) | 0);
    if ((size === 0)) {
      const this$1 = $m_sci_Vector$();
      return this$1.NIL$6
    };
    const s = new $c_sci_Vector().init___I__I__I(0, size, 0);
    const depth = this.depth$1;
    $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s, this, depth);
    if ((this.depth$1 > 1)) {
      const xor = (((-1) + size) | 0);
      $f_sci_VectorPointer__gotoPos__I__I__V(s, 0, xor)
    };
    return s
  };
  $$plus$eq__O__scm_Builder(elem) {
    return this.$$plus$eq__O__sci_VectorBuilder(elem)
  };
  sizeHint__I__V(size) {
    /*<skip>*/
  };
  depth$und$eq__I__V(x$1) {
    this.depth$1 = x$1
  };
  display2__AO() {
    return this.display2$1
  };
  display0$und$eq__AO__V(x$1) {
    this.display0$1 = x$1
  };
  $$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs) {
    return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
  };
  display3$und$eq__AO__V(x$1) {
    this.display3$1 = x$1
  };
}
const $is_sci_VectorBuilder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_VectorBuilder)))
});
const $isArrayOf_sci_VectorBuilder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_VectorBuilder)))
});
const $d_sci_VectorBuilder = new $TypeData().initClass({
  sci_VectorBuilder: 0
}, false, "scala.collection.immutable.VectorBuilder", {
  sci_VectorBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  sci_VectorPointer: 1
});
$c_sci_VectorBuilder.prototype.$classData = $d_sci_VectorBuilder;
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
class $c_Ljava_io_PrintStream extends $c_Ljava_io_FilterOutputStream {
  constructor() {
    super();
    this.encoder$3 = null;
    this.autoFlush$3 = false;
    this.charset$3 = null;
    this.closing$3 = false;
    this.java$io$PrintStream$$closed$3 = false;
    this.errorFlag$3 = false;
    this.bitmap$0$3 = false
  };
  init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset(_out, autoFlush, charset) {
    this.autoFlush$3 = autoFlush;
    this.charset$3 = charset;
    $c_Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream.call(this, _out);
    this.closing$3 = false;
    this.java$io$PrintStream$$closed$3 = false;
    this.errorFlag$3 = false;
    return this
  };
  println__T__V(s) {
    this.print__T__V(s);
    this.java$lang$JSConsoleBasedPrintStream$$printString__T__V("\n")
  };
}
const $is_Ljava_io_PrintStream = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljava_io_PrintStream)))
});
const $isArrayOf_Ljava_io_PrintStream = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljava_io_PrintStream)))
});
class $c_sc_Seq$ extends $c_scg_SeqFactory {
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    return this
  };
  newBuilder__scm_Builder() {
    $m_sci_Seq$();
    return new $c_scm_ListBuffer().init___()
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
class $c_sci_HashMap$ extends $c_scg_ImmutableMapFactory {
  constructor() {
    super();
    this.defaultMerger$4 = null
  };
  init___() {
    $n_sci_HashMap$ = this;
    const mergef = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this) {
      return (function(a$2, b$2) {
        const a = a$2;
        return a
      })
    })(this));
    this.defaultMerger$4 = new $c_sci_HashMap$$anon$2().init___F2(mergef);
    return this
  };
  scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(hash0, elem0, hash1, elem1, level, size) {
    const index0 = (31 & ((hash0 >>> level) | 0));
    const index1 = (31 & ((hash1 >>> level) | 0));
    if ((index0 !== index1)) {
      const bitmap = ((1 << index0) | (1 << index1));
      const elems = $newArrayObject($d_sci_HashMap.getArrayOf(), [2]);
      if ((index0 < index1)) {
        elems.u[0] = elem0;
        elems.u[1] = elem1
      } else {
        elems.u[0] = elem1;
        elems.u[1] = elem0
      };
      return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(bitmap, elems, size)
    } else {
      const elems$2 = $newArrayObject($d_sci_HashMap.getArrayOf(), [1]);
      const bitmap$2 = (1 << index0);
      elems$2.u[0] = this.scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(hash0, elem0, hash1, elem1, ((5 + level) | 0), size);
      return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(bitmap$2, elems$2, size)
    }
  };
}
const $d_sci_HashMap$ = new $TypeData().initClass({
  sci_HashMap$: 0
}, false, "scala.collection.immutable.HashMap$", {
  sci_HashMap$: 1,
  scg_ImmutableMapFactory: 1,
  scg_MapFactory: 1,
  scg_GenMapFactory: 1,
  O: 1,
  scg_BitOperations$Int: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashMap$.prototype.$classData = $d_sci_HashMap$;
let $n_sci_HashMap$ = (void 0);
const $m_sci_HashMap$ = (function() {
  if ((!$n_sci_HashMap$)) {
    $n_sci_HashMap$ = new $c_sci_HashMap$().init___()
  };
  return $n_sci_HashMap$
});
class $c_sci_Seq$ extends $c_scg_SeqFactory {
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    return this
  };
  newBuilder__scm_Builder() {
    return new $c_scm_ListBuffer().init___()
  };
}
const $d_sci_Seq$ = new $TypeData().initClass({
  sci_Seq$: 0
}, false, "scala.collection.immutable.Seq$", {
  sci_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Seq$.prototype.$classData = $d_sci_Seq$;
let $n_sci_Seq$ = (void 0);
const $m_sci_Seq$ = (function() {
  if ((!$n_sci_Seq$)) {
    $n_sci_Seq$ = new $c_sci_Seq$().init___()
  };
  return $n_sci_Seq$
});
class $c_scm_IndexedSeq$ extends $c_scg_SeqFactory {
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    return this
  };
  newBuilder__scm_Builder() {
    return new $c_scm_ArrayBuffer().init___()
  };
}
const $d_scm_IndexedSeq$ = new $TypeData().initClass({
  scm_IndexedSeq$: 0
}, false, "scala.collection.mutable.IndexedSeq$", {
  scm_IndexedSeq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_scm_IndexedSeq$.prototype.$classData = $d_scm_IndexedSeq$;
let $n_scm_IndexedSeq$ = (void 0);
const $m_scm_IndexedSeq$ = (function() {
  if ((!$n_scm_IndexedSeq$)) {
    $n_scm_IndexedSeq$ = new $c_scm_IndexedSeq$().init___()
  };
  return $n_scm_IndexedSeq$
});
class $c_sjs_js_WrappedArray$ extends $c_scg_SeqFactory {
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    return this
  };
  newBuilder__scm_Builder() {
    return new $c_sjs_js_WrappedArray().init___()
  };
}
const $d_sjs_js_WrappedArray$ = new $TypeData().initClass({
  sjs_js_WrappedArray$: 0
}, false, "scala.scalajs.js.WrappedArray$", {
  sjs_js_WrappedArray$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sjs_js_WrappedArray$.prototype.$classData = $d_sjs_js_WrappedArray$;
let $n_sjs_js_WrappedArray$ = (void 0);
const $m_sjs_js_WrappedArray$ = (function() {
  if ((!$n_sjs_js_WrappedArray$)) {
    $n_sjs_js_WrappedArray$ = new $c_sjs_js_WrappedArray$().init___()
  };
  return $n_sjs_js_WrappedArray$
});
class $c_jl_JSConsoleBasedPrintStream extends $c_Ljava_io_PrintStream {
  constructor() {
    super();
    this.isErr$4 = null;
    this.flushed$4 = false;
    this.buffer$4 = null
  };
  init___jl_Boolean(isErr) {
    this.isErr$4 = isErr;
    const out = new $c_jl_JSConsoleBasedPrintStream$DummyOutputStream().init___();
    $c_Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset.call(this, out, false, null);
    this.flushed$4 = true;
    this.buffer$4 = "";
    return this
  };
  print__T__V(s) {
    this.java$lang$JSConsoleBasedPrintStream$$printString__T__V(((s === null) ? "null" : s))
  };
  java$lang$JSConsoleBasedPrintStream$$printString__T__V(s) {
    let rest = s;
    while ((rest !== "")) {
      const thiz = rest;
      const nlPos = (thiz.indexOf("\n") | 0);
      if ((nlPos < 0)) {
        this.buffer$4 = (("" + this.buffer$4) + rest);
        this.flushed$4 = false;
        rest = ""
      } else {
        const jsx$1 = this.buffer$4;
        const thiz$1 = rest;
        this.doWriteLine__p4__T__V((("" + jsx$1) + thiz$1.substring(0, nlPos)));
        this.buffer$4 = "";
        this.flushed$4 = true;
        const thiz$2 = rest;
        const beginIndex = ((1 + nlPos) | 0);
        rest = thiz$2.substring(beginIndex)
      }
    }
  };
  doWriteLine__p4__T__V(line) {
    const x = $g.console;
    if ((!(!(!(!x))))) {
      const x$1 = this.isErr$4;
      let jsx$1;
      if ((!(!x$1))) {
        const x$2 = $g.console.error;
        jsx$1 = (!(!(!(!x$2))))
      } else {
        jsx$1 = false
      };
      if (jsx$1) {
        $g.console.error(line)
      } else {
        $g.console.log(line)
      }
    }
  };
}
const $d_jl_JSConsoleBasedPrintStream = new $TypeData().initClass({
  jl_JSConsoleBasedPrintStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream", {
  jl_JSConsoleBasedPrintStream: 1,
  Ljava_io_PrintStream: 1,
  Ljava_io_FilterOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  jl_AutoCloseable: 1,
  Ljava_io_Flushable: 1,
  jl_Appendable: 1
});
$c_jl_JSConsoleBasedPrintStream.prototype.$classData = $d_jl_JSConsoleBasedPrintStream;
class $c_s_concurrent_impl_Promise$DefaultPromise extends $c_ju_concurrent_atomic_AtomicReference {
  compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise__s_concurrent_impl_Promise$DefaultPromise(linked) {
    _compressedRoot: while (true) {
      const target = linked.root__p2__s_concurrent_impl_Promise$DefaultPromise();
      if ((linked === target)) {
        return target
      } else if (this.compareAndSet__O__O__Z(linked, target)) {
        return target
      } else {
        const x1 = this.value$1;
        if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
          const x2 = x1;
          linked = x2;
          continue _compressedRoot
        } else {
          return this
        }
      }
    }
  };
  init___() {
    $c_ju_concurrent_atomic_AtomicReference.prototype.init___O.call(this, $m_sci_Nil$());
    return this
  };
  dispatchOrAddCallback__p2__s_concurrent_impl_CallbackRunnable__V(runnable) {
    let _$this = this;
    _dispatchOrAddCallback: while (true) {
      const x1 = _$this.value$1;
      if ($is_s_util_Try(x1)) {
        const x2 = x1;
        runnable.executeWithValue__s_util_Try__V(x2)
      } else {
        if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
          const x3 = x1;
          _$this = _$this.compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise__s_concurrent_impl_Promise$DefaultPromise(x3);
          continue _dispatchOrAddCallback
        };
        if ((!$is_sci_List(x1))) {
          throw new $c_s_MatchError().init___O(x1)
        };
        const x4 = x1;
        if ((!_$this.compareAndSet__O__O__Z(x4, new $c_sci_$colon$colon().init___O__sci_List(runnable, x4)))) {
          continue _dispatchOrAddCallback
        }
      };
      break
    }
  };
  tryComplete__s_util_Try__Z(value) {
    const resolved = $m_s_concurrent_impl_Promise$().scala$concurrent$impl$Promise$$resolveTry__s_util_Try__s_util_Try(value);
    const x1 = this.tryCompleteAndGetListeners__p2__s_util_Try__sci_List(resolved);
    if ((x1 !== null)) {
      if (x1.isEmpty__Z()) {
        return true
      } else {
        let these = x1;
        while ((!these.isEmpty__Z())) {
          const arg1 = these.head__O();
          const r = arg1;
          r.executeWithValue__s_util_Try__V(resolved);
          const this$1 = these;
          these = this$1.tail__sci_List()
        };
        return true
      }
    } else {
      return false
    }
  };
  toString__T() {
    return $f_s_concurrent_impl_Promise__toString__T(this)
  };
  link__p2__s_concurrent_impl_Promise$DefaultPromise__V(target) {
    let _$this = this;
    _link: while (true) {
      if ((_$this !== target)) {
        const x1 = _$this.value$1;
        matchEnd6: {
          if ($is_s_util_Try(x1)) {
            const x2 = x1;
            if ((!target.tryComplete__s_util_Try__Z(x2))) {
              throw new $c_jl_IllegalStateException().init___T("Cannot link completed promises together")
            };
            break matchEnd6
          };
          if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
            const x3 = x1;
            _$this = _$this.compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise__s_concurrent_impl_Promise$DefaultPromise(x3);
            continue _link
          };
          if ($is_sci_List(x1)) {
            const x4 = x1;
            if (_$this.compareAndSet__O__O__Z(x4, target)) {
              if ($f_sc_TraversableOnce__nonEmpty__Z(x4)) {
                let these = x4;
                while ((!these.isEmpty__Z())) {
                  const arg1 = these.head__O();
                  const x$2 = arg1;
                  target.dispatchOrAddCallback__p2__s_concurrent_impl_CallbackRunnable__V(x$2);
                  const this$1 = these;
                  these = this$1.tail__sci_List()
                };
                break matchEnd6
              } else {
                break matchEnd6
              }
            }
          };
          continue _link
        }
      };
      break
    }
  };
  fallbackTo__s_concurrent_Future__s_concurrent_Future(that) {
    return $f_s_concurrent_Future__fallbackTo__s_concurrent_Future__s_concurrent_Future(this, that)
  };
  root__p2__s_concurrent_impl_Promise$DefaultPromise() {
    let _$this = this;
    _root: while (true) {
      const x1 = _$this.value$1;
      if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
        const x2 = x1;
        _$this = x2;
        continue _root
      } else {
        return _$this
      }
    }
  };
  compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise() {
    const x1 = this.value$1;
    if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
      const x2 = x1;
      return this.compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise__s_concurrent_impl_Promise$DefaultPromise(x2)
    } else {
      return this
    }
  };
  tryCompleteAndGetListeners__p2__s_util_Try__sci_List(v) {
    let _$this = this;
    _tryCompleteAndGetListeners: while (true) {
      const x1 = _$this.value$1;
      if ($is_sci_List(x1)) {
        const x2 = x1;
        if (_$this.compareAndSet__O__O__Z(x2, v)) {
          return x2
        } else {
          continue _tryCompleteAndGetListeners
        }
      } else if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
        const x3 = x1;
        _$this = _$this.compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise__s_concurrent_impl_Promise$DefaultPromise(x3);
        continue _tryCompleteAndGetListeners
      } else {
        return null
      }
    }
  };
  onComplete__F1__s_concurrent_ExecutionContext__V(func, executor) {
    this.dispatchOrAddCallback__p2__s_concurrent_impl_CallbackRunnable__V(new $c_s_concurrent_impl_CallbackRunnable().init___s_concurrent_ExecutionContext__F1(executor, func))
  };
  map__F1__s_concurrent_ExecutionContext__s_concurrent_Future(f, executor) {
    return $f_s_concurrent_Future__map__F1__s_concurrent_ExecutionContext__s_concurrent_Future(this, f, executor)
  };
  value__s_Option() {
    return this.value0__p2__s_Option()
  };
  filter__F1__s_concurrent_ExecutionContext__s_concurrent_Future(p, executor) {
    return $f_s_concurrent_Future__filter__F1__s_concurrent_ExecutionContext__s_concurrent_Future(this, p, executor)
  };
  value0__p2__s_Option() {
    let _$this = this;
    _value0: while (true) {
      const x1 = _$this.value$1;
      if ($is_s_util_Try(x1)) {
        const x2 = x1;
        return new $c_s_Some().init___O(x2)
      } else if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
        const x3 = x1;
        _$this = _$this.compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise__s_concurrent_impl_Promise$DefaultPromise(x3);
        continue _value0
      } else {
        return $m_s_None$()
      }
    }
  };
  recoverWith__s_PartialFunction__s_concurrent_ExecutionContext__s_concurrent_Future(pf, executor) {
    return $f_s_concurrent_Future__recoverWith__s_PartialFunction__s_concurrent_ExecutionContext__s_concurrent_Future(this, pf, executor)
  };
}
const $is_s_concurrent_impl_Promise$DefaultPromise = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_concurrent_impl_Promise$DefaultPromise)))
});
const $isArrayOf_s_concurrent_impl_Promise$DefaultPromise = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_concurrent_impl_Promise$DefaultPromise)))
});
const $d_s_concurrent_impl_Promise$DefaultPromise = new $TypeData().initClass({
  s_concurrent_impl_Promise$DefaultPromise: 0
}, false, "scala.concurrent.impl.Promise$DefaultPromise", {
  s_concurrent_impl_Promise$DefaultPromise: 1,
  ju_concurrent_atomic_AtomicReference: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_concurrent_impl_Promise: 1,
  s_concurrent_Promise: 1,
  s_concurrent_Future: 1,
  s_concurrent_Awaitable: 1
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.$classData = $d_s_concurrent_impl_Promise$DefaultPromise;
class $c_s_reflect_AnyValManifest extends $c_O {
  constructor() {
    super();
    this.toString$1 = null
  };
  equals__O__Z(that) {
    return (this === that)
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
  newBuilder__scm_Builder() {
    $m_sci_IndexedSeq$();
    $m_sci_Vector$();
    return new $c_sci_VectorBuilder().init___()
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
class $c_sci_HashSet$ extends $c_scg_ImmutableSetFactory {
  init___() {
    return this
  };
  scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(hash0, elem0, hash1, elem1, level) {
    const index0 = (31 & ((hash0 >>> level) | 0));
    const index1 = (31 & ((hash1 >>> level) | 0));
    if ((index0 !== index1)) {
      const bitmap = ((1 << index0) | (1 << index1));
      const elems = $newArrayObject($d_sci_HashSet.getArrayOf(), [2]);
      if ((index0 < index1)) {
        elems.u[0] = elem0;
        elems.u[1] = elem1
      } else {
        elems.u[0] = elem1;
        elems.u[1] = elem0
      };
      return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap, elems, ((elem0.size__I() + elem1.size__I()) | 0))
    } else {
      const elems$2 = $newArrayObject($d_sci_HashSet.getArrayOf(), [1]);
      const bitmap$2 = (1 << index0);
      const child = this.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(hash0, elem0, hash1, elem1, ((5 + level) | 0));
      elems$2.u[0] = child;
      return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap$2, elems$2, child.size0$5)
    }
  };
  emptyInstance__sci_Set() {
    return $m_sci_HashSet$EmptyHashSet$()
  };
}
const $d_sci_HashSet$ = new $TypeData().initClass({
  sci_HashSet$: 0
}, false, "scala.collection.immutable.HashSet$", {
  sci_HashSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$.prototype.$classData = $d_sci_HashSet$;
let $n_sci_HashSet$ = (void 0);
const $m_sci_HashSet$ = (function() {
  if ((!$n_sci_HashSet$)) {
    $n_sci_HashSet$ = new $c_sci_HashSet$().init___()
  };
  return $n_sci_HashSet$
});
class $c_sci_IndexedSeq$ extends $c_scg_IndexedSeqFactory {
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    return this
  };
  newBuilder__scm_Builder() {
    $m_sci_Vector$();
    return new $c_sci_VectorBuilder().init___()
  };
}
const $d_sci_IndexedSeq$ = new $TypeData().initClass({
  sci_IndexedSeq$: 0
}, false, "scala.collection.immutable.IndexedSeq$", {
  sci_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_IndexedSeq$.prototype.$classData = $d_sci_IndexedSeq$;
let $n_sci_IndexedSeq$ = (void 0);
const $m_sci_IndexedSeq$ = (function() {
  if ((!$n_sci_IndexedSeq$)) {
    $n_sci_IndexedSeq$ = new $c_sci_IndexedSeq$().init___()
  };
  return $n_sci_IndexedSeq$
});
class $c_sci_ListSet$ extends $c_scg_ImmutableSetFactory {
  init___() {
    return this
  };
  emptyInstance__sci_Set() {
    return $m_sci_ListSet$EmptyListSet$()
  };
}
const $d_sci_ListSet$ = new $TypeData().initClass({
  sci_ListSet$: 0
}, false, "scala.collection.immutable.ListSet$", {
  sci_ListSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$.prototype.$classData = $d_sci_ListSet$;
let $n_sci_ListSet$ = (void 0);
const $m_sci_ListSet$ = (function() {
  if ((!$n_sci_ListSet$)) {
    $n_sci_ListSet$ = new $c_sci_ListSet$().init___()
  };
  return $n_sci_ListSet$
});
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
  equals__O__Z(x$1) {
    if ((this === x$1)) {
      return true
    } else if ($is_sjs_js_JavaScriptException(x$1)) {
      const JavaScriptException$1 = x$1;
      return $m_sr_BoxesRunTime$().equals__O__O__Z(this.exception$4, JavaScriptException$1.exception$4)
    } else {
      return false
    }
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
  equals__O__Z(that) {
    return (this === that)
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
const $f_sc_IterableLike__sameElements__sc_GenIterable__Z = (function($thiz, that) {
  const these = $thiz.iterator__sc_Iterator();
  const those = that.iterator__sc_Iterator();
  while ((these.hasNext__Z() && those.hasNext__Z())) {
    if ((!$m_sr_BoxesRunTime$().equals__O__O__Z(these.next__O(), those.next__O()))) {
      return false
    }
  };
  return ((!these.hasNext__Z()) && (!those.hasNext__Z()))
});
const $f_sc_IterableLike__take__I__O = (function($thiz, n) {
  const b = $thiz.newBuilder__scm_Builder();
  if ((n <= 0)) {
    return b.result__O()
  } else {
    b.sizeHintBounded__I__sc_TraversableLike__V(n, $thiz);
    let i = 0;
    const it = $thiz.iterator__sc_Iterator();
    while (((i < n) && it.hasNext__Z())) {
      b.$$plus$eq__O__scm_Builder(it.next__O());
      i = ((1 + i) | 0)
    };
    return b.result__O()
  }
});
const $f_sc_IterableLike__copyToArray__O__I__I__V = (function($thiz, xs, start, len) {
  let i = start;
  const x = ((start + len) | 0);
  const that = $m_sr_ScalaRunTime$().array$undlength__O__I(xs);
  const end = ((x < that) ? x : that);
  const it = $thiz.iterator__sc_Iterator();
  while (((i < end) && it.hasNext__Z())) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, i, it.next__O());
    i = ((1 + i) | 0)
  }
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
  empty__sc_GenTraversable() {
    return $m_sci_Nil$()
  };
  newBuilder__scm_Builder() {
    return new $c_scm_ListBuffer().init___()
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
  empty__sc_GenTraversable() {
    return $m_sci_Stream$Empty$()
  };
  newBuilder__scm_Builder() {
    return new $c_sci_Stream$StreamBuilder().init___()
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
class $c_scm_ArrayBuffer$ extends $c_scg_SeqFactory {
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    return this
  };
  newBuilder__scm_Builder() {
    return new $c_scm_ArrayBuffer().init___()
  };
}
const $d_scm_ArrayBuffer$ = new $TypeData().initClass({
  scm_ArrayBuffer$: 0
}, false, "scala.collection.mutable.ArrayBuffer$", {
  scm_ArrayBuffer$: 1,
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
$c_scm_ArrayBuffer$.prototype.$classData = $d_scm_ArrayBuffer$;
let $n_scm_ArrayBuffer$ = (void 0);
const $m_scm_ArrayBuffer$ = (function() {
  if ((!$n_scm_ArrayBuffer$)) {
    $n_scm_ArrayBuffer$ = new $c_scm_ArrayBuffer$().init___()
  };
  return $n_scm_ArrayBuffer$
});
class $c_scm_ListBuffer$ extends $c_scg_SeqFactory {
  init___() {
    $c_scg_GenTraversableFactory.prototype.init___.call(this);
    return this
  };
  newBuilder__scm_Builder() {
    return new $c_scm_GrowingBuilder().init___scg_Growable(new $c_scm_ListBuffer().init___())
  };
}
const $d_scm_ListBuffer$ = new $TypeData().initClass({
  scm_ListBuffer$: 0
}, false, "scala.collection.mutable.ListBuffer$", {
  scm_ListBuffer$: 1,
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
$c_scm_ListBuffer$.prototype.$classData = $d_scm_ListBuffer$;
let $n_scm_ListBuffer$ = (void 0);
const $m_scm_ListBuffer$ = (function() {
  if ((!$n_scm_ListBuffer$)) {
    $n_scm_ListBuffer$ = new $c_scm_ListBuffer$().init___()
  };
  return $n_scm_ListBuffer$
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
const $is_sc_GenMap = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenMap)))
});
const $isArrayOf_sc_GenMap = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenMap)))
});
const $is_sc_GenSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSeq)))
});
const $isArrayOf_sc_GenSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSeq)))
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
  empty__sc_GenTraversable() {
    return this.NIL$6
  };
  newBuilder__scm_Builder() {
    return new $c_sci_VectorBuilder().init___()
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
  toList__sci_List() {
    const this$1 = $m_sci_List$();
    const cbf = this$1.ReusableCBFInstance$2;
    return $f_sc_TraversableLike__to__scg_CanBuildFrom__O(this, cbf)
  };
  mkString__T__T(sep) {
    return this.mkString__T__T__T__T("", sep, "")
  };
  mkString__T__T__T__T(start, sep, end) {
    return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
  };
  toVector__sci_Vector() {
    $m_sci_Vector$();
    const cbf = $m_sc_IndexedSeq$().ReusableCBF$6;
    return $f_sc_TraversableLike__to__scg_CanBuildFrom__O(this, cbf)
  };
  sizeHintIfCheap__I() {
    return (-1)
  };
  $$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(that, bf) {
    return $f_sc_TraversableLike__$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(this, that, bf)
  };
  addString__scm_StringBuilder__T__T__T__scm_StringBuilder(b, start, sep, end) {
    return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
  };
  repr__O() {
    return this
  };
  isTraversableAgain__Z() {
    return true
  };
  newBuilder__scm_Builder() {
    return this.companion__scg_GenericCompanion().newBuilder__scm_Builder()
  };
  stringPrefix__T() {
    return $f_sc_TraversableLike__stringPrefix__T(this)
  };
}
const $f_sc_SeqLike__isEmpty__Z = (function($thiz) {
  return ($thiz.lengthCompare__I__I(0) === 0)
});
const $f_sc_SeqLike__$$colon$plus__O__scg_CanBuildFrom__O = (function($thiz, elem, bf) {
  const b = bf.apply__O__scm_Builder($thiz.repr__O());
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz.thisCollection__sc_Seq());
  b.$$plus$eq__O__scm_Builder(elem);
  return b.result__O()
});
const $f_sc_SeqLike__$$plus$colon__O__scg_CanBuildFrom__O = (function($thiz, elem, bf) {
  const b = bf.apply__O__scm_Builder($thiz.repr__O());
  b.$$plus$eq__O__scm_Builder(elem);
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz.thisCollection__sc_Seq());
  return b.result__O()
});
const $is_sc_GenSet = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSet)))
});
const $isArrayOf_sc_GenSet = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSet)))
});
const $is_sc_IndexedSeqLike = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeqLike)))
});
const $isArrayOf_sc_IndexedSeqLike = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeqLike)))
});
const $is_sc_LinearSeqLike = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqLike)))
});
const $isArrayOf_sc_LinearSeqLike = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqLike)))
});
const $f_sc_IndexedSeqOptimized__lengthCompare__I__I = (function($thiz, len) {
  return (($thiz.length__I() - len) | 0)
});
const $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z = (function($thiz, that) {
  if ($is_sc_IndexedSeq(that)) {
    const x2 = that;
    const len = $thiz.length__I();
    if ((len === x2.length__I())) {
      let i = 0;
      while (((i < len) && $m_sr_BoxesRunTime$().equals__O__O__Z($thiz.apply__I__O(i), x2.apply__I__O(i)))) {
        i = ((1 + i) | 0)
      };
      return (i === len)
    } else {
      return false
    }
  } else {
    return $f_sc_IterableLike__sameElements__sc_GenIterable__Z($thiz, that)
  }
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
const $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V = (function($thiz, xs, start, len) {
  let i = 0;
  let j = start;
  const x = $thiz.length__I();
  const x$1 = ((x < len) ? x : len);
  const that = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  const end = ((x$1 < that) ? x$1 : that);
  while ((i < end)) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, j, $thiz.apply__I__O(i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
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
const $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z = (function($thiz, that) {
  if ($is_sc_LinearSeq(that)) {
    const x2 = that;
    if (($thiz === x2)) {
      return true
    } else {
      let these = $thiz;
      let those = x2;
      while ((((!these.isEmpty__Z()) && (!those.isEmpty__Z())) && $m_sr_BoxesRunTime$().equals__O__O__Z(these.head__O(), those.head__O()))) {
        these = these.tail__O();
        those = those.tail__O()
      };
      return (these.isEmpty__Z() && those.isEmpty__Z())
    }
  } else {
    return $f_sc_IterableLike__sameElements__sc_GenIterable__Z($thiz, that)
  }
});
const $f_sc_LinearSeqOptimized__apply__I__O = (function($thiz, n) {
  const rest = $thiz.drop__I__sc_LinearSeqOptimized(n);
  if (((n < 0) || rest.isEmpty__Z())) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  };
  return rest.head__O()
});
const $f_sc_LinearSeqOptimized__length__I = (function($thiz) {
  let these = $thiz;
  let len = 0;
  while ((!these.isEmpty__Z())) {
    len = ((1 + len) | 0);
    these = these.tail__O()
  };
  return len
});
const $f_sc_LinearSeqOptimized__last__O = (function($thiz) {
  if ($thiz.isEmpty__Z()) {
    throw new $c_ju_NoSuchElementException().init___()
  };
  let these = $thiz;
  let nx = these.tail__O();
  while ((!nx.isEmpty__Z())) {
    these = nx;
    nx = nx.tail__O()
  };
  return these.head__O()
});
const $f_sc_LinearSeqOptimized__isDefinedAt__I__Z = (function($thiz, x) {
  return ((x >= 0) && ($f_sc_LinearSeqOptimized__lengthCompare__I__I($thiz, x) > 0))
});
const $f_sc_LinearSeqOptimized__loop$1__psc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I = (function($thiz, i, xs, len$1) {
  _loop: while (true) {
    if ((i === len$1)) {
      return (xs.isEmpty__Z() ? 0 : 1)
    } else if (xs.isEmpty__Z()) {
      return (-1)
    } else {
      const temp$i = ((1 + i) | 0);
      const temp$xs = xs.tail__O();
      i = temp$i;
      xs = temp$xs;
      continue _loop
    }
  }
});
const $is_sc_LinearSeqOptimized = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqOptimized)))
});
const $isArrayOf_sc_LinearSeqOptimized = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqOptimized)))
});
const $f_sc_SetLike__isEmpty__Z = (function($thiz) {
  return ($thiz.size__I() === 0)
});
const $f_sc_MapLike__apply__O__O = (function($thiz, key) {
  const x1 = $thiz.get__O__s_Option(key);
  const x = $m_s_None$();
  if ((x === x1)) {
    return $f_sc_MapLike__$default__O__O($thiz, key)
  } else if ($is_s_Some(x1)) {
    const x2 = x1;
    const value = x2.value$2;
    return value
  } else {
    throw new $c_s_MatchError().init___O(x1)
  }
});
const $f_sc_MapLike__isEmpty__Z = (function($thiz) {
  return ($thiz.size__I() === 0)
});
const $f_sc_MapLike__$default__O__O = (function($thiz, key) {
  throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
});
const $f_sc_MapLike__contains__O__Z = (function($thiz, key) {
  return $thiz.get__O__s_Option(key).isDefined__Z()
});
const $f_sc_MapLike__addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function($thiz, b, start, sep, end) {
  const this$2 = $thiz.iterator__sc_Iterator();
  const f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x0$1$2) {
      const x0$1 = x0$1$2;
      if ((x0$1 !== null)) {
        const k = x0$1.$$und1$f;
        const v = x0$1.$$und2$f;
        return (("" + $m_s_Predef$any2stringadd$().$$plus$extension__O__T__T(k, " -> ")) + v)
      } else {
        throw new $c_s_MatchError().init___O(x0$1)
      }
    })
  })($thiz));
  const this$3 = new $c_sc_Iterator$$anon$10().init___sc_Iterator__F1(this$2, f);
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this$3, b, start, sep, end)
});
const $f_sc_MapLike__applyOrElse__O__F1__O = (function($thiz, x, $default) {
  const x1 = $thiz.get__O__s_Option(x);
  if ($is_s_Some(x1)) {
    const x2 = x1;
    const v = x2.value$2;
    return v
  } else {
    const x$1 = $m_s_None$();
    if ((x$1 === x1)) {
      return $default.apply__O__O(x)
    } else {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
});
class $c_sc_AbstractIterable extends $c_sc_AbstractTraversable {
  sameElements__sc_GenIterable__Z(that) {
    return $f_sc_IterableLike__sameElements__sc_GenIterable__Z(this, that)
  };
  forall__F1__Z(p) {
    const this$1 = this.iterator__sc_Iterator();
    return $f_sc_Iterator__forall__F1__Z(this$1, p)
  };
  foreach__F1__V(f) {
    const this$1 = this.iterator__sc_Iterator();
    $f_sc_Iterator__foreach__F1__V(this$1, f)
  };
  toStream__sci_Stream() {
    return this.iterator__sc_Iterator().toStream__sci_Stream()
  };
  copyToArray__O__I__I__V(xs, start, len) {
    $f_sc_IterableLike__copyToArray__O__I__I__V(this, xs, start, len)
  };
}
const $is_sci_Iterable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Iterable)))
});
const $isArrayOf_sci_Iterable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Iterable)))
});
const $d_sci_Iterable = new $TypeData().initClass({
  sci_Iterable: 0
}, true, "scala.collection.immutable.Iterable", {
  sci_Iterable: 1,
  sci_Traversable: 1,
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
  s_Immutable: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1
});
class $c_sci_StringOps extends $c_O {
  constructor() {
    super();
    this.repr$1 = null
  };
  seq__sc_TraversableOnce() {
    const $$this = this.repr$1;
    return new $c_sci_WrappedString().init___T($$this)
  };
  apply__I__O(idx) {
    const $$this = this.repr$1;
    const c = (65535 & ($$this.charCodeAt(idx) | 0));
    return new $c_jl_Character().init___C(c)
  };
  lengthCompare__I__I(len) {
    return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
  };
  sameElements__sc_GenIterable__Z(that) {
    return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
  };
  isEmpty__Z() {
    return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
  };
  toList__sci_List() {
    const this$1 = $m_sci_List$();
    const cbf = this$1.ReusableCBFInstance$2;
    return $f_sc_TraversableLike__to__scg_CanBuildFrom__O(this, cbf)
  };
  thisCollection__sc_Traversable() {
    const $$this = this.repr$1;
    return new $c_sci_WrappedString().init___T($$this)
  };
  equals__O__Z(x$1) {
    return $m_sci_StringOps$().equals$extension__T__O__Z(this.repr$1, x$1)
  };
  mkString__T__T__T__T(start, sep, end) {
    return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
  };
  mkString__T__T(sep) {
    return $f_sc_TraversableOnce__mkString__T__T__T__T(this, "", sep, "")
  };
  toString__T() {
    const $$this = this.repr$1;
    return $$this
  };
  foreach__F1__V(f) {
    $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
  };
  toVector__sci_Vector() {
    $m_sci_Vector$();
    const cbf = $m_sc_IndexedSeq$().ReusableCBF$6;
    return $f_sc_TraversableLike__to__scg_CanBuildFrom__O(this, cbf)
  };
  size__I() {
    const $$this = this.repr$1;
    return ($$this.length | 0)
  };
  iterator__sc_Iterator() {
    const $$this = this.repr$1;
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, ($$this.length | 0))
  };
  length__I() {
    const $$this = this.repr$1;
    return ($$this.length | 0)
  };
  $$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(that, bf) {
    return $f_sc_TraversableLike__$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(this, that, bf)
  };
  sizeHintIfCheap__I() {
    const $$this = this.repr$1;
    return ($$this.length | 0)
  };
  toStream__sci_Stream() {
    const $$this = this.repr$1;
    const this$3 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, ($$this.length | 0));
    return $f_sc_Iterator__toStream__sci_Stream(this$3)
  };
  thisCollection__sc_Seq() {
    const $$this = this.repr$1;
    return new $c_sci_WrappedString().init___T($$this)
  };
  addString__scm_StringBuilder__T__T__T__scm_StringBuilder(b, start, sep, end) {
    return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
  };
  repr__O() {
    return this.repr$1
  };
  hashCode__I() {
    const $$this = this.repr$1;
    return $m_sjsr_RuntimeString$().hashCode__T__I($$this)
  };
  isTraversableAgain__Z() {
    return true
  };
  copyToArray__O__I__I__V(xs, start, len) {
    $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
  };
  init___T(repr) {
    this.repr$1 = repr;
    return this
  };
  newBuilder__scm_Builder() {
    return new $c_scm_StringBuilder().init___()
  };
  stringPrefix__T() {
    return $f_sc_TraversableLike__stringPrefix__T(this)
  };
}
const $is_sci_StringOps = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_StringOps)))
});
const $isArrayOf_sci_StringOps = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_StringOps)))
});
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
const $is_sc_Seq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Seq)))
});
const $isArrayOf_sc_Seq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Seq)))
});
class $c_sjs_js_ArrayOps extends $c_O {
  constructor() {
    super();
    this.scala$scalajs$js$ArrayOps$$array$f = null
  };
  seq__sc_TraversableOnce() {
    return this.seq__sc_IndexedSeq()
  };
  seq__sc_IndexedSeq() {
    return new $c_sjs_js_WrappedArray().init___sjs_js_Array(this.scala$scalajs$js$ArrayOps$$array$f)
  };
  init___() {
    $c_sjs_js_ArrayOps.prototype.init___sjs_js_Array.call(this, []);
    return this
  };
  apply__I__O(index) {
    return this.scala$scalajs$js$ArrayOps$$array$f[index]
  };
  lengthCompare__I__I(len) {
    return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
  };
  sameElements__sc_GenIterable__Z(that) {
    return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
  };
  isEmpty__Z() {
    return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
  };
  toList__sci_List() {
    const this$1 = $m_sci_List$();
    const cbf = this$1.ReusableCBFInstance$2;
    return $f_sc_TraversableLike__to__scg_CanBuildFrom__O(this, cbf)
  };
  thisCollection__sc_Traversable() {
    return this.thisCollection__scm_IndexedSeq()
  };
  equals__O__Z(that) {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  };
  mkString__T__T__T__T(start, sep, end) {
    return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
  };
  mkString__T__T(sep) {
    return $f_sc_TraversableOnce__mkString__T__T__T__T(this, "", sep, "")
  };
  $$plus$eq__O__scg_Growable(elem) {
    this.scala$scalajs$js$ArrayOps$$array$f.push(elem);
    return this
  };
  thisCollection__scm_IndexedSeq() {
    const repr = this.scala$scalajs$js$ArrayOps$$array$f;
    return new $c_sjs_js_WrappedArray().init___sjs_js_Array(repr)
  };
  toString__T() {
    return $f_sc_TraversableLike__toString__T(this)
  };
  foreach__F1__V(f) {
    $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
  };
  toVector__sci_Vector() {
    $m_sci_Vector$();
    const cbf = $m_sc_IndexedSeq$().ReusableCBF$6;
    return $f_sc_TraversableLike__to__scg_CanBuildFrom__O(this, cbf)
  };
  size__I() {
    return (this.scala$scalajs$js$ArrayOps$$array$f.length | 0)
  };
  result__O() {
    return this.scala$scalajs$js$ArrayOps$$array$f
  };
  iterator__sc_Iterator() {
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, (this.scala$scalajs$js$ArrayOps$$array$f.length | 0))
  };
  sizeHintBounded__I__sc_TraversableLike__V(size, boundingColl) {
    $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
  };
  $$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(that, bf) {
    return $f_sc_TraversableLike__$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(this, that, bf)
  };
  length__I() {
    return (this.scala$scalajs$js$ArrayOps$$array$f.length | 0)
  };
  sizeHintIfCheap__I() {
    return (this.scala$scalajs$js$ArrayOps$$array$f.length | 0)
  };
  toStream__sci_Stream() {
    const this$1 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, (this.scala$scalajs$js$ArrayOps$$array$f.length | 0));
    return $f_sc_Iterator__toStream__sci_Stream(this$1)
  };
  thisCollection__sc_Seq() {
    return this.thisCollection__scm_IndexedSeq()
  };
  addString__scm_StringBuilder__T__T__T__scm_StringBuilder(b, start, sep, end) {
    return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
  };
  repr__O() {
    return this.scala$scalajs$js$ArrayOps$$array$f
  };
  $$plus$eq__O__scm_Builder(elem) {
    this.scala$scalajs$js$ArrayOps$$array$f.push(elem);
    return this
  };
  sizeHint__I__V(size) {
    /*<skip>*/
  };
  copyToArray__O__I__I__V(xs, start, len) {
    $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
  };
  isTraversableAgain__Z() {
    return true
  };
  hashCode__I() {
    return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this.seq__sc_IndexedSeq())
  };
  init___sjs_js_Array(array) {
    this.scala$scalajs$js$ArrayOps$$array$f = array;
    return this
  };
  newBuilder__scm_Builder() {
    return new $c_sjs_js_ArrayOps().init___()
  };
  $$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs) {
    return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
  };
  stringPrefix__T() {
    return $f_sc_TraversableLike__stringPrefix__T(this)
  };
}
const $is_sjs_js_ArrayOps = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_ArrayOps)))
});
const $isArrayOf_sjs_js_ArrayOps = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_ArrayOps)))
});
const $d_sjs_js_ArrayOps = new $TypeData().initClass({
  sjs_js_ArrayOps: 0
}, false, "scala.scalajs.js.ArrayOps", {
  sjs_js_ArrayOps: 1,
  O: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
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
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_sjs_js_ArrayOps.prototype.$classData = $d_sjs_js_ArrayOps;
const $is_sc_IndexedSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeq)))
});
const $isArrayOf_sc_IndexedSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeq)))
});
const $is_sc_LinearSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeq)))
});
const $isArrayOf_sc_LinearSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeq)))
});
class $c_sc_AbstractSeq extends $c_sc_AbstractIterable {
  equals__O__Z(that) {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  };
  isEmpty__Z() {
    return $f_sc_SeqLike__isEmpty__Z(this)
  };
  toString__T() {
    return $f_sc_TraversableLike__toString__T(this)
  };
  $$plus$colon__O__scg_CanBuildFrom__O(elem, bf) {
    return $f_sc_SeqLike__$$plus$colon__O__scg_CanBuildFrom__O(this, elem, bf)
  };
  size__I() {
    return this.length__I()
  };
  thisCollection__sc_Seq() {
    return this
  };
  applyOrElse__O__F1__O(x, $default) {
    return $f_s_PartialFunction__applyOrElse__O__F1__O(this, x, $default)
  };
  hashCode__I() {
    return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this.seq__sc_Seq())
  };
}
class $c_sc_AbstractMap extends $c_sc_AbstractIterable {
  apply__O__O(key) {
    return $f_sc_MapLike__apply__O__O(this, key)
  };
  isEmpty__Z() {
    return $f_sc_MapLike__isEmpty__Z(this)
  };
  equals__O__Z(that) {
    return $f_sc_GenMapLike__equals__O__Z(this, that)
  };
  toString__T() {
    return $f_sc_TraversableLike__toString__T(this)
  };
  contains__O__Z(key) {
    return $f_sc_MapLike__contains__O__Z(this, key)
  };
  addString__scm_StringBuilder__T__T__T__scm_StringBuilder(b, start, sep, end) {
    return $f_sc_MapLike__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
  };
  isDefinedAt__O__Z(key) {
    return this.contains__O__Z(key)
  };
  applyOrElse__O__F1__O(x, $default) {
    return $f_sc_MapLike__applyOrElse__O__F1__O(this, x, $default)
  };
  hashCode__I() {
    const this$1 = $m_s_util_hashing_MurmurHash3$();
    const xs = this.seq__sc_Map();
    return this$1.unorderedHash__sc_TraversableOnce__I__I(xs, this$1.mapSeed$2)
  };
  newBuilder__scm_Builder() {
    return new $c_scm_MapBuilder().init___sc_GenMap(this.empty__sc_Map())
  };
  stringPrefix__T() {
    return "Map"
  };
}
class $c_sc_AbstractSet extends $c_sc_AbstractIterable {
  equals__O__Z(that) {
    return $f_sc_GenSetLike__equals__O__Z(this, that)
  };
  isEmpty__Z() {
    return $f_sc_SetLike__isEmpty__Z(this)
  };
  toString__T() {
    return $f_sc_TraversableLike__toString__T(this)
  };
  subsetOf__sc_GenSet__Z(that) {
    return this.forall__F1__Z(that)
  };
  hashCode__I() {
    const this$1 = $m_s_util_hashing_MurmurHash3$();
    return this$1.unorderedHash__sc_TraversableOnce__I__I(this, this$1.setSeed$2)
  };
  stringPrefix__T() {
    return "Set"
  };
  newBuilder__scm_Builder() {
    return new $c_scm_SetBuilder().init___sc_Set(this.empty__sc_Set())
  };
}
const $is_sci_Map = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Map)))
});
const $isArrayOf_sci_Map = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Map)))
});
class $c_sci_AbstractMap extends $c_sc_AbstractMap {
  seq__sc_TraversableOnce() {
    return this
  };
  thisCollection__sc_Traversable() {
    return this
  };
  companion__scg_GenericCompanion() {
    return $m_sci_Iterable$()
  };
  empty__sc_Map() {
    return this.empty__sci_Map()
  };
  empty__sci_Map() {
    return $m_sci_Map$EmptyMap$()
  };
  seq__sc_Map() {
    return this
  };
}
class $c_sci_ListSet extends $c_sc_AbstractSet {
  seq__sc_TraversableOnce() {
    return this
  };
  next__sci_ListSet() {
    throw new $c_ju_NoSuchElementException().init___T("next of empty set")
  };
  apply__O__O(v1) {
    return this.contains__O__Z(v1)
  };
  isEmpty__Z() {
    return true
  };
  thisCollection__sc_Traversable() {
    return this
  };
  companion__scg_GenericCompanion() {
    return $m_sci_ListSet$()
  };
  $$plus__O__sci_ListSet(elem) {
    return new $c_sci_ListSet$Node().init___sci_ListSet__O(this, elem)
  };
  size__I() {
    return 0
  };
  iterator__sc_Iterator() {
    const this$1 = this.reverseList$1__p4__sci_List();
    return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$1)
  };
  empty__sc_Set() {
    return $m_sci_ListSet$EmptyListSet$()
  };
  reverseList$1__p4__sci_List() {
    let curr = this;
    let res = $m_sci_Nil$();
    while ((!curr.isEmpty__Z())) {
      const x$4 = curr.elem__O();
      const this$1 = res;
      res = new $c_sci_$colon$colon().init___O__sci_List(x$4, this$1);
      curr = curr.next__sci_ListSet()
    };
    return res
  };
  contains__O__Z(elem) {
    return false
  };
  elem__O() {
    throw new $c_ju_NoSuchElementException().init___T("elem of empty set")
  };
  $$plus__O__sc_Set(elem) {
    return this.$$plus__O__sci_ListSet(elem)
  };
  stringPrefix__T() {
    return "ListSet"
  };
}
class $c_sci_Set$EmptySet$ extends $c_sc_AbstractSet {
  seq__sc_TraversableOnce() {
    return this
  };
  init___() {
    return this
  };
  apply__O__O(v1) {
    return false
  };
  thisCollection__sc_Traversable() {
    return this
  };
  companion__scg_GenericCompanion() {
    return $m_sci_Set$()
  };
  foreach__F1__V(f) {
    /*<skip>*/
  };
  size__I() {
    return 0
  };
  iterator__sc_Iterator() {
    return $m_sc_Iterator$().empty$1
  };
  empty__sc_Set() {
    return $m_sci_Set$EmptySet$()
  };
  $$plus__O__sc_Set(elem) {
    return new $c_sci_Set$Set1().init___O(elem)
  };
}
const $d_sci_Set$EmptySet$ = new $TypeData().initClass({
  sci_Set$EmptySet$: 0
}, false, "scala.collection.immutable.Set$EmptySet$", {
  sci_Set$EmptySet$: 1,
  sc_AbstractSet: 1,
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
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$EmptySet$.prototype.$classData = $d_sci_Set$EmptySet$;
let $n_sci_Set$EmptySet$ = (void 0);
const $m_sci_Set$EmptySet$ = (function() {
  if ((!$n_sci_Set$EmptySet$)) {
    $n_sci_Set$EmptySet$ = new $c_sci_Set$EmptySet$().init___()
  };
  return $n_sci_Set$EmptySet$
});
class $c_sci_Set$Set1 extends $c_sc_AbstractSet {
  constructor() {
    super();
    this.elem1$4 = null
  };
  seq__sc_TraversableOnce() {
    return this
  };
  apply__O__O(v1) {
    return this.contains__O__Z(v1)
  };
  thisCollection__sc_Traversable() {
    return this
  };
  companion__scg_GenericCompanion() {
    return $m_sci_Set$()
  };
  forall__F1__Z(p) {
    return (!(!p.apply__O__O(this.elem1$4)))
  };
  foreach__F1__V(f) {
    f.apply__O__O(this.elem1$4)
  };
  size__I() {
    return 1
  };
  init___O(elem1) {
    this.elem1$4 = elem1;
    return this
  };
  iterator__sc_Iterator() {
    $m_sc_Iterator$();
    const elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4]);
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, (elems.array$6.length | 0))
  };
  empty__sc_Set() {
    return $m_sci_Set$EmptySet$()
  };
  $$plus__O__sci_Set(elem) {
    return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set2().init___O__O(this.elem1$4, elem))
  };
  contains__O__Z(elem) {
    return $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4)
  };
  $$plus__O__sc_Set(elem) {
    return this.$$plus__O__sci_Set(elem)
  };
}
const $d_sci_Set$Set1 = new $TypeData().initClass({
  sci_Set$Set1: 0
}, false, "scala.collection.immutable.Set$Set1", {
  sci_Set$Set1: 1,
  sc_AbstractSet: 1,
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
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set1.prototype.$classData = $d_sci_Set$Set1;
class $c_sci_Set$Set2 extends $c_sc_AbstractSet {
  constructor() {
    super();
    this.elem1$4 = null;
    this.elem2$4 = null
  };
  seq__sc_TraversableOnce() {
    return this
  };
  apply__O__O(v1) {
    return this.contains__O__Z(v1)
  };
  thisCollection__sc_Traversable() {
    return this
  };
  init___O__O(elem1, elem2) {
    this.elem1$4 = elem1;
    this.elem2$4 = elem2;
    return this
  };
  companion__scg_GenericCompanion() {
    return $m_sci_Set$()
  };
  forall__F1__Z(p) {
    return ((!(!p.apply__O__O(this.elem1$4))) && (!(!p.apply__O__O(this.elem2$4))))
  };
  foreach__F1__V(f) {
    f.apply__O__O(this.elem1$4);
    f.apply__O__O(this.elem2$4)
  };
  size__I() {
    return 2
  };
  iterator__sc_Iterator() {
    $m_sc_Iterator$();
    const elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4]);
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, (elems.array$6.length | 0))
  };
  empty__sc_Set() {
    return $m_sci_Set$EmptySet$()
  };
  $$plus__O__sci_Set(elem) {
    return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set3().init___O__O__O(this.elem1$4, this.elem2$4, elem))
  };
  contains__O__Z(elem) {
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4))
  };
  $$plus__O__sc_Set(elem) {
    return this.$$plus__O__sci_Set(elem)
  };
}
const $d_sci_Set$Set2 = new $TypeData().initClass({
  sci_Set$Set2: 0
}, false, "scala.collection.immutable.Set$Set2", {
  sci_Set$Set2: 1,
  sc_AbstractSet: 1,
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
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set2.prototype.$classData = $d_sci_Set$Set2;
class $c_sci_Set$Set3 extends $c_sc_AbstractSet {
  constructor() {
    super();
    this.elem1$4 = null;
    this.elem2$4 = null;
    this.elem3$4 = null
  };
  seq__sc_TraversableOnce() {
    return this
  };
  apply__O__O(v1) {
    return this.contains__O__Z(v1)
  };
  thisCollection__sc_Traversable() {
    return this
  };
  companion__scg_GenericCompanion() {
    return $m_sci_Set$()
  };
  forall__F1__Z(p) {
    return (((!(!p.apply__O__O(this.elem1$4))) && (!(!p.apply__O__O(this.elem2$4)))) && (!(!p.apply__O__O(this.elem3$4))))
  };
  foreach__F1__V(f) {
    f.apply__O__O(this.elem1$4);
    f.apply__O__O(this.elem2$4);
    f.apply__O__O(this.elem3$4)
  };
  init___O__O__O(elem1, elem2, elem3) {
    this.elem1$4 = elem1;
    this.elem2$4 = elem2;
    this.elem3$4 = elem3;
    return this
  };
  size__I() {
    return 3
  };
  iterator__sc_Iterator() {
    $m_sc_Iterator$();
    const elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4, this.elem3$4]);
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, (elems.array$6.length | 0))
  };
  empty__sc_Set() {
    return $m_sci_Set$EmptySet$()
  };
  $$plus__O__sci_Set(elem) {
    return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set4().init___O__O__O__O(this.elem1$4, this.elem2$4, this.elem3$4, elem))
  };
  contains__O__Z(elem) {
    return (($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4))
  };
  $$plus__O__sc_Set(elem) {
    return this.$$plus__O__sci_Set(elem)
  };
}
const $d_sci_Set$Set3 = new $TypeData().initClass({
  sci_Set$Set3: 0
}, false, "scala.collection.immutable.Set$Set3", {
  sci_Set$Set3: 1,
  sc_AbstractSet: 1,
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
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set3.prototype.$classData = $d_sci_Set$Set3;
class $c_sci_Set$Set4 extends $c_sc_AbstractSet {
  constructor() {
    super();
    this.elem1$4 = null;
    this.elem2$4 = null;
    this.elem3$4 = null;
    this.elem4$4 = null
  };
  seq__sc_TraversableOnce() {
    return this
  };
  apply__O__O(v1) {
    return this.contains__O__Z(v1)
  };
  thisCollection__sc_Traversable() {
    return this
  };
  companion__scg_GenericCompanion() {
    return $m_sci_Set$()
  };
  forall__F1__Z(p) {
    return ((((!(!p.apply__O__O(this.elem1$4))) && (!(!p.apply__O__O(this.elem2$4)))) && (!(!p.apply__O__O(this.elem3$4)))) && (!(!p.apply__O__O(this.elem4$4))))
  };
  foreach__F1__V(f) {
    f.apply__O__O(this.elem1$4);
    f.apply__O__O(this.elem2$4);
    f.apply__O__O(this.elem3$4);
    f.apply__O__O(this.elem4$4)
  };
  size__I() {
    return 4
  };
  iterator__sc_Iterator() {
    $m_sc_Iterator$();
    const elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4, this.elem3$4, this.elem4$4]);
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, (elems.array$6.length | 0))
  };
  empty__sc_Set() {
    return $m_sci_Set$EmptySet$()
  };
  $$plus__O__sci_Set(elem) {
    return (this.contains__O__Z(elem) ? this : new $c_sci_HashSet().init___().$$plus__O__sci_HashSet(this.elem1$4).$$plus__O__sci_HashSet(this.elem2$4).$$plus__O__sci_HashSet(this.elem3$4).$$plus__O__sci_HashSet(this.elem4$4).$$plus__O__sci_HashSet(elem))
  };
  contains__O__Z(elem) {
    return ((($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem4$4))
  };
  init___O__O__O__O(elem1, elem2, elem3, elem4) {
    this.elem1$4 = elem1;
    this.elem2$4 = elem2;
    this.elem3$4 = elem3;
    this.elem4$4 = elem4;
    return this
  };
  $$plus__O__sc_Set(elem) {
    return this.$$plus__O__sci_Set(elem)
  };
}
const $d_sci_Set$Set4 = new $TypeData().initClass({
  sci_Set$Set4: 0
}, false, "scala.collection.immutable.Set$Set4", {
  sci_Set$Set4: 1,
  sc_AbstractSet: 1,
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
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set4.prototype.$classData = $d_sci_Set$Set4;
class $c_sci_HashSet extends $c_sc_AbstractSet {
  updated0__O__I__I__sci_HashSet(key, hash, level) {
    return new $c_sci_HashSet$HashSet1().init___O__I(key, hash)
  };
  computeHash__O__I(key) {
    return this.improve__I__I($m_sr_Statics$().anyHash__O__I(key))
  };
  seq__sc_TraversableOnce() {
    return this
  };
  init___() {
    return this
  };
  apply__O__O(v1) {
    return this.contains__O__Z(v1)
  };
  $$plus__O__sci_HashSet(e) {
    return this.updated0__O__I__I__sci_HashSet(e, this.computeHash__O__I(e), 0)
  };
  thisCollection__sc_Traversable() {
    return this
  };
  companion__scg_GenericCompanion() {
    return $m_sci_HashSet$()
  };
  foreach__F1__V(f) {
    /*<skip>*/
  };
  subsetOf__sc_GenSet__Z(that) {
    if ($is_sci_HashSet(that)) {
      const x2 = that;
      return this.subsetOf0__sci_HashSet__I__Z(x2, 0)
    } else {
      const this$1 = this.iterator__sc_Iterator();
      return $f_sc_Iterator__forall__F1__Z(this$1, that)
    }
  };
  size__I() {
    return 0
  };
  iterator__sc_Iterator() {
    return $m_sc_Iterator$().empty$1
  };
  empty__sc_Set() {
    return $m_sci_HashSet$EmptyHashSet$()
  };
  improve__I__I(hcode) {
    let h = ((hcode + (~(hcode << 9))) | 0);
    h = (h ^ ((h >>> 14) | 0));
    h = ((h + (h << 4)) | 0);
    return (h ^ ((h >>> 10) | 0))
  };
  contains__O__Z(e) {
    return this.get0__O__I__I__Z(e, this.computeHash__O__I(e), 0)
  };
  get0__O__I__I__Z(key, hash, level) {
    return false
  };
  $$plus__O__sc_Set(elem) {
    return this.$$plus__O__sci_HashSet(elem)
  };
  subsetOf0__sci_HashSet__I__Z(that, level) {
    return true
  };
}
const $is_sci_HashSet = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet)))
});
const $isArrayOf_sci_HashSet = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet)))
});
const $d_sci_HashSet = new $TypeData().initClass({
  sci_HashSet: 0
}, false, "scala.collection.immutable.HashSet", {
  sci_HashSet: 1,
  sc_AbstractSet: 1,
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
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet.prototype.$classData = $d_sci_HashSet;
class $c_sci_ListSet$EmptyListSet$ extends $c_sci_ListSet {
  init___() {
    return this
  };
}
const $d_sci_ListSet$EmptyListSet$ = new $TypeData().initClass({
  sci_ListSet$EmptyListSet$: 0
}, false, "scala.collection.immutable.ListSet$EmptyListSet$", {
  sci_ListSet$EmptyListSet$: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
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
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$EmptyListSet$.prototype.$classData = $d_sci_ListSet$EmptyListSet$;
let $n_sci_ListSet$EmptyListSet$ = (void 0);
const $m_sci_ListSet$EmptyListSet$ = (function() {
  if ((!$n_sci_ListSet$EmptyListSet$)) {
    $n_sci_ListSet$EmptyListSet$ = new $c_sci_ListSet$EmptyListSet$().init___()
  };
  return $n_sci_ListSet$EmptyListSet$
});
class $c_sci_ListSet$Node extends $c_sci_ListSet {
  constructor() {
    super();
    this.elem$5 = null;
    this.$$outer$5 = null
  };
  next__sci_ListSet() {
    return this.$$outer$5
  };
  isEmpty__Z() {
    return false
  };
  $$plus__O__sci_ListSet(e) {
    return (this.containsInternal__p5__sci_ListSet__O__Z(this, e) ? this : new $c_sci_ListSet$Node().init___sci_ListSet__O(this, e))
  };
  sizeInternal__p5__sci_ListSet__I__I(n, acc) {
    _sizeInternal: while (true) {
      if (n.isEmpty__Z()) {
        return acc
      } else {
        const temp$n = n.next__sci_ListSet();
        const temp$acc = ((1 + acc) | 0);
        n = temp$n;
        acc = temp$acc;
        continue _sizeInternal
      }
    }
  };
  size__I() {
    return this.sizeInternal__p5__sci_ListSet__I__I(this, 0)
  };
  init___sci_ListSet__O($$outer, elem) {
    this.elem$5 = elem;
    if (($$outer === null)) {
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
    } else {
      this.$$outer$5 = $$outer
    };
    return this
  };
  elem__O() {
    return this.elem$5
  };
  contains__O__Z(e) {
    return this.containsInternal__p5__sci_ListSet__O__Z(this, e)
  };
  containsInternal__p5__sci_ListSet__O__Z(n, e) {
    _containsInternal: while (true) {
      if ((!n.isEmpty__Z())) {
        if ($m_sr_BoxesRunTime$().equals__O__O__Z(n.elem__O(), e)) {
          return true
        } else {
          n = n.next__sci_ListSet();
          continue _containsInternal
        }
      } else {
        return false
      }
    }
  };
  $$plus__O__sc_Set(elem) {
    return this.$$plus__O__sci_ListSet(elem)
  };
}
const $d_sci_ListSet$Node = new $TypeData().initClass({
  sci_ListSet$Node: 0
}, false, "scala.collection.immutable.ListSet$Node", {
  sci_ListSet$Node: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
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
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$Node.prototype.$classData = $d_sci_ListSet$Node;
class $c_scm_AbstractSeq extends $c_sc_AbstractSeq {
  seq__sc_TraversableOnce() {
    return this.seq__scm_Seq()
  };
  seq__scm_Seq() {
    return this
  };
}
class $c_sci_HashSet$EmptyHashSet$ extends $c_sci_HashSet {
  init___() {
    return this
  };
}
const $d_sci_HashSet$EmptyHashSet$ = new $TypeData().initClass({
  sci_HashSet$EmptyHashSet$: 0
}, false, "scala.collection.immutable.HashSet$EmptyHashSet$", {
  sci_HashSet$EmptyHashSet$: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
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
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$EmptyHashSet$.prototype.$classData = $d_sci_HashSet$EmptyHashSet$;
let $n_sci_HashSet$EmptyHashSet$ = (void 0);
const $m_sci_HashSet$EmptyHashSet$ = (function() {
  if ((!$n_sci_HashSet$EmptyHashSet$)) {
    $n_sci_HashSet$EmptyHashSet$ = new $c_sci_HashSet$EmptyHashSet$().init___()
  };
  return $n_sci_HashSet$EmptyHashSet$
});
class $c_sci_HashSet$HashTrieSet extends $c_sci_HashSet {
  constructor() {
    super();
    this.bitmap$5 = 0;
    this.elems$5 = null;
    this.size0$5 = 0
  };
  updated0__O__I__I__sci_HashSet(key, hash, level) {
    const index = (31 & ((hash >>> level) | 0));
    const mask = (1 << index);
    const offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
    if (((this.bitmap$5 & mask) !== 0)) {
      const sub = this.elems$5.u[offset];
      const subNew = sub.updated0__O__I__I__sci_HashSet(key, hash, ((5 + level) | 0));
      if ((sub === subNew)) {
        return this
      } else {
        const elemsNew = $newArrayObject($d_sci_HashSet.getArrayOf(), [this.elems$5.u.length]);
        $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew, 0, this.elems$5.u.length);
        elemsNew.u[offset] = subNew;
        return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(this.bitmap$5, elemsNew, ((this.size0$5 + ((subNew.size__I() - sub.size__I()) | 0)) | 0))
      }
    } else {
      const elemsNew$2 = $newArrayObject($d_sci_HashSet.getArrayOf(), [((1 + this.elems$5.u.length) | 0)]);
      $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew$2, 0, offset);
      elemsNew$2.u[offset] = new $c_sci_HashSet$HashSet1().init___O__I(key, hash);
      $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, offset, elemsNew$2, ((1 + offset) | 0), ((this.elems$5.u.length - offset) | 0));
      const bitmapNew = (this.bitmap$5 | mask);
      return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmapNew, elemsNew$2, ((1 + this.size0$5) | 0))
    }
  };
  foreach__F1__V(f) {
    let i = 0;
    while ((i < this.elems$5.u.length)) {
      this.elems$5.u[i].foreach__F1__V(f);
      i = ((1 + i) | 0)
    }
  };
  size__I() {
    return this.size0$5
  };
  iterator__sc_Iterator() {
    return new $c_sci_HashSet$HashTrieSet$$anon$1().init___sci_HashSet$HashTrieSet(this)
  };
  init___I__Asci_HashSet__I(bitmap, elems, size0) {
    this.bitmap$5 = bitmap;
    this.elems$5 = elems;
    this.size0$5 = size0;
    $m_s_Predef$().assert__Z__V(($m_jl_Integer$().bitCount__I__I(bitmap) === elems.u.length));
    return this
  };
  get0__O__I__I__Z(key, hash, level) {
    const index = (31 & ((hash >>> level) | 0));
    const mask = (1 << index);
    if ((this.bitmap$5 === (-1))) {
      return this.elems$5.u[(31 & index)].get0__O__I__I__Z(key, hash, ((5 + level) | 0))
    } else if (((this.bitmap$5 & mask) !== 0)) {
      const offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
      return this.elems$5.u[offset].get0__O__I__I__Z(key, hash, ((5 + level) | 0))
    } else {
      return false
    }
  };
  subsetOf0__sci_HashSet__I__Z(that, level) {
    if ((that === this)) {
      return true
    } else {
      if ($is_sci_HashSet$HashTrieSet(that)) {
        const x2 = that;
        if ((this.size0$5 <= x2.size0$5)) {
          let abm = this.bitmap$5;
          const a = this.elems$5;
          let ai = 0;
          const b = x2.elems$5;
          let bbm = x2.bitmap$5;
          let bi = 0;
          if (((abm & bbm) === abm)) {
            while ((abm !== 0)) {
              const alsb = (abm ^ (abm & (((-1) + abm) | 0)));
              const blsb = (bbm ^ (bbm & (((-1) + bbm) | 0)));
              if ((alsb === blsb)) {
                if ((!a.u[ai].subsetOf0__sci_HashSet__I__Z(b.u[bi], ((5 + level) | 0)))) {
                  return false
                };
                abm = (abm & (~alsb));
                ai = ((1 + ai) | 0)
              };
              bbm = (bbm & (~blsb));
              bi = ((1 + bi) | 0)
            };
            return true
          } else {
            return false
          }
        }
      };
      return false
    }
  };
}
const $is_sci_HashSet$HashTrieSet = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashTrieSet)))
});
const $isArrayOf_sci_HashSet$HashTrieSet = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashTrieSet)))
});
const $d_sci_HashSet$HashTrieSet = new $TypeData().initClass({
  sci_HashSet$HashTrieSet: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet", {
  sci_HashSet$HashTrieSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
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
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashTrieSet.prototype.$classData = $d_sci_HashSet$HashTrieSet;
class $c_sci_HashSet$LeafHashSet extends $c_sci_HashSet {
}
class $c_sci_ListMap extends $c_sci_AbstractMap {
  value__O() {
    throw new $c_ju_NoSuchElementException().init___T("value of empty map")
  };
  isEmpty__Z() {
    return true
  };
  thisCollection__sc_Traversable() {
    return this
  };
  empty__sc_Map() {
    return $m_sci_ListMap$EmptyListMap$()
  };
  empty__sci_Map() {
    return $m_sci_ListMap$EmptyListMap$()
  };
  size__I() {
    return 0
  };
  seq__sc_Map() {
    return this
  };
  $$plus__T2__sci_ListMap(kv) {
    return new $c_sci_ListMap$Node().init___sci_ListMap__O__O(this, kv.$$und1$f, kv.$$und2$f)
  };
  iterator__sc_Iterator() {
    const this$1 = this.reverseList$1__p5__sci_List();
    return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$1)
  };
  key__O() {
    throw new $c_ju_NoSuchElementException().init___T("key of empty map")
  };
  updated__O__O__sci_ListMap(key, value) {
    return new $c_sci_ListMap$Node().init___sci_ListMap__O__O(this, key, value)
  };
  get__O__s_Option(key) {
    return $m_s_None$()
  };
  reverseList$1__p5__sci_List() {
    let curr = this;
    let res = $m_sci_Nil$();
    while ((!curr.isEmpty__Z())) {
      const x$4 = new $c_T2().init___O__O(curr.key__O(), curr.value__O());
      const this$1 = res;
      res = new $c_sci_$colon$colon().init___O__sci_List(x$4, this$1);
      curr = curr.next__sci_ListMap()
    };
    return res
  };
  next__sci_ListMap() {
    throw new $c_ju_NoSuchElementException().init___T("next of empty map")
  };
  $$plus__T2__sc_GenMap(kv) {
    return this.$$plus__T2__sci_ListMap(kv)
  };
  stringPrefix__T() {
    return "ListMap"
  };
}
const $is_sci_ListMap = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_ListMap)))
});
const $isArrayOf_sci_ListMap = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_ListMap)))
});
class $c_sci_Map$EmptyMap$ extends $c_sci_AbstractMap {
  init___() {
    return this
  };
  apply__O__O(key) {
    this.apply__O__sr_Nothing$(key)
  };
  size__I() {
    return 0
  };
  iterator__sc_Iterator() {
    return $m_sc_Iterator$().empty$1
  };
  get__O__s_Option(key) {
    return $m_s_None$()
  };
  contains__O__Z(key) {
    return false
  };
  apply__O__sr_Nothing$(key) {
    throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
  };
  $$plus__T2__sc_GenMap(kv) {
    const key = kv.$$und1$f;
    const value = kv.$$und2$f;
    return new $c_sci_Map$Map1().init___O__O(key, value)
  };
}
const $d_sci_Map$EmptyMap$ = new $TypeData().initClass({
  sci_Map$EmptyMap$: 0
}, false, "scala.collection.immutable.Map$EmptyMap$", {
  sci_Map$EmptyMap$: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
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
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$EmptyMap$.prototype.$classData = $d_sci_Map$EmptyMap$;
let $n_sci_Map$EmptyMap$ = (void 0);
const $m_sci_Map$EmptyMap$ = (function() {
  if ((!$n_sci_Map$EmptyMap$)) {
    $n_sci_Map$EmptyMap$ = new $c_sci_Map$EmptyMap$().init___()
  };
  return $n_sci_Map$EmptyMap$
});
class $c_sci_Map$Map1 extends $c_sci_AbstractMap {
  constructor() {
    super();
    this.key1$5 = null;
    this.value1$5 = null
  };
  apply__O__O(key) {
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)) {
      return this.value1$5
    } else {
      throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
    }
  };
  init___O__O(key1, value1) {
    this.key1$5 = key1;
    this.value1$5 = value1;
    return this
  };
  foreach__F1__V(f) {
    f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5))
  };
  size__I() {
    return 1
  };
  iterator__sc_Iterator() {
    $m_sc_Iterator$();
    const elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_T2().init___O__O(this.key1$5, this.value1$5)]);
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, (elems.array$6.length | 0))
  };
  updated__O__O__sci_Map(key, value) {
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map1().init___O__O(this.key1$5, value) : new $c_sci_Map$Map2().init___O__O__O__O(this.key1$5, this.value1$5, key, value))
  };
  get__O__s_Option(key) {
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : $m_s_None$())
  };
  contains__O__Z(key) {
    return $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)
  };
  $$plus__T2__sc_GenMap(kv) {
    return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
  };
}
const $d_sci_Map$Map1 = new $TypeData().initClass({
  sci_Map$Map1: 0
}, false, "scala.collection.immutable.Map$Map1", {
  sci_Map$Map1: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
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
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map1.prototype.$classData = $d_sci_Map$Map1;
class $c_sci_Map$Map2 extends $c_sci_AbstractMap {
  constructor() {
    super();
    this.key1$5 = null;
    this.value1$5 = null;
    this.key2$5 = null;
    this.value2$5 = null
  };
  apply__O__O(key) {
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)) {
      return this.value1$5
    } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) {
      return this.value2$5
    } else {
      throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
    }
  };
  foreach__F1__V(f) {
    f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5));
    f.apply__O__O(new $c_T2().init___O__O(this.key2$5, this.value2$5))
  };
  size__I() {
    return 2
  };
  iterator__sc_Iterator() {
    $m_sc_Iterator$();
    const elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_T2().init___O__O(this.key1$5, this.value1$5), new $c_T2().init___O__O(this.key2$5, this.value2$5)]);
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, (elems.array$6.length | 0))
  };
  updated__O__O__sci_Map(key, value) {
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map2().init___O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_sci_Map$Map2().init___O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value) : new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, key, value)))
  };
  get__O__s_Option(key) {
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_s_Some().init___O(this.value2$5) : $m_s_None$()))
  };
  contains__O__Z(key) {
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5))
  };
  init___O__O__O__O(key1, value1, key2, value2) {
    this.key1$5 = key1;
    this.value1$5 = value1;
    this.key2$5 = key2;
    this.value2$5 = value2;
    return this
  };
  $$plus__T2__sc_GenMap(kv) {
    return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
  };
}
const $d_sci_Map$Map2 = new $TypeData().initClass({
  sci_Map$Map2: 0
}, false, "scala.collection.immutable.Map$Map2", {
  sci_Map$Map2: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
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
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map2.prototype.$classData = $d_sci_Map$Map2;
class $c_sci_Map$Map3 extends $c_sci_AbstractMap {
  constructor() {
    super();
    this.key1$5 = null;
    this.value1$5 = null;
    this.key2$5 = null;
    this.value2$5 = null;
    this.key3$5 = null;
    this.value3$5 = null
  };
  apply__O__O(key) {
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)) {
      return this.value1$5
    } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) {
      return this.value2$5
    } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5)) {
      return this.value3$5
    } else {
      throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
    }
  };
  foreach__F1__V(f) {
    f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5));
    f.apply__O__O(new $c_T2().init___O__O(this.key2$5, this.value2$5));
    f.apply__O__O(new $c_T2().init___O__O(this.key3$5, this.value3$5))
  };
  init___O__O__O__O__O__O(key1, value1, key2, value2, key3, value3) {
    this.key1$5 = key1;
    this.value1$5 = value1;
    this.key2$5 = key2;
    this.value2$5 = value2;
    this.key3$5 = key3;
    this.value3$5 = value3;
    return this
  };
  size__I() {
    return 3
  };
  iterator__sc_Iterator() {
    $m_sc_Iterator$();
    const elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_T2().init___O__O(this.key1$5, this.value1$5), new $c_T2().init___O__O(this.key2$5, this.value2$5), new $c_T2().init___O__O(this.key3$5, this.value3$5)]);
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, (elems.array$6.length | 0))
  };
  updated__O__O__sci_Map(key, value) {
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5, this.key3$5, this.value3$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value, this.key3$5, this.value3$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, value) : new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, this.value3$5, key, value))))
  };
  get__O__s_Option(key) {
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_s_Some().init___O(this.value2$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_s_Some().init___O(this.value3$5) : $m_s_None$())))
  };
  contains__O__Z(key) {
    return (($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5))
  };
  $$plus__T2__sc_GenMap(kv) {
    return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
  };
}
const $d_sci_Map$Map3 = new $TypeData().initClass({
  sci_Map$Map3: 0
}, false, "scala.collection.immutable.Map$Map3", {
  sci_Map$Map3: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
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
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map3.prototype.$classData = $d_sci_Map$Map3;
class $c_sci_Map$Map4 extends $c_sci_AbstractMap {
  constructor() {
    super();
    this.key1$5 = null;
    this.value1$5 = null;
    this.key2$5 = null;
    this.value2$5 = null;
    this.key3$5 = null;
    this.value3$5 = null;
    this.key4$5 = null;
    this.value4$5 = null
  };
  apply__O__O(key) {
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)) {
      return this.value1$5
    } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) {
      return this.value2$5
    } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5)) {
      return this.value3$5
    } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5)) {
      return this.value4$5
    } else {
      throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
    }
  };
  foreach__F1__V(f) {
    f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5));
    f.apply__O__O(new $c_T2().init___O__O(this.key2$5, this.value2$5));
    f.apply__O__O(new $c_T2().init___O__O(this.key3$5, this.value3$5));
    f.apply__O__O(new $c_T2().init___O__O(this.key4$5, this.value4$5))
  };
  size__I() {
    return 4
  };
  iterator__sc_Iterator() {
    $m_sc_Iterator$();
    const elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_T2().init___O__O(this.key1$5, this.value1$5), new $c_T2().init___O__O(this.key2$5, this.value2$5), new $c_T2().init___O__O(this.key3$5, this.value3$5), new $c_T2().init___O__O(this.key4$5, this.value4$5)]);
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, (elems.array$6.length | 0))
  };
  updated__O__O__sci_Map(key, value) {
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5, this.key3$5, this.value3$5, this.key4$5, this.value4$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value, this.key3$5, this.value3$5, this.key4$5, this.value4$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, value, this.key4$5, this.value4$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5) ? new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, this.value3$5, this.key4$5, value) : new $c_sci_HashMap().init___().updated__O__O__sci_HashMap(this.key1$5, this.value1$5).updated__O__O__sci_HashMap(this.key2$5, this.value2$5).updated__O__O__sci_HashMap(this.key3$5, this.value3$5).updated__O__O__sci_HashMap(this.key4$5, this.value4$5).updated__O__O__sci_HashMap(key, value)))))
  };
  init___O__O__O__O__O__O__O__O(key1, value1, key2, value2, key3, value3, key4, value4) {
    this.key1$5 = key1;
    this.value1$5 = value1;
    this.key2$5 = key2;
    this.value2$5 = value2;
    this.key3$5 = key3;
    this.value3$5 = value3;
    this.key4$5 = key4;
    this.value4$5 = value4;
    return this
  };
  get__O__s_Option(key) {
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_s_Some().init___O(this.value2$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_s_Some().init___O(this.value3$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5) ? new $c_s_Some().init___O(this.value4$5) : $m_s_None$()))))
  };
  contains__O__Z(key) {
    return ((($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5)) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5))
  };
  $$plus__T2__sc_GenMap(kv) {
    return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
  };
}
const $d_sci_Map$Map4 = new $TypeData().initClass({
  sci_Map$Map4: 0
}, false, "scala.collection.immutable.Map$Map4", {
  sci_Map$Map4: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
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
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map4.prototype.$classData = $d_sci_Map$Map4;
class $c_sci_HashMap extends $c_sci_AbstractMap {
  computeHash__O__I(key) {
    return this.improve__I__I($m_sr_Statics$().anyHash__O__I(key))
  };
  seq__sc_TraversableOnce() {
    return this
  };
  init___() {
    return this
  };
  thisCollection__sc_Traversable() {
    return this
  };
  updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(key, hash, level, value, kv, merger) {
    return new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv)
  };
  get0__O__I__I__s_Option(key, hash, level) {
    return $m_s_None$()
  };
  $$plus__T2__sci_HashMap(kv) {
    return this.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(kv.$$und1$f, this.computeHash__O__I(kv.$$und1$f), 0, kv.$$und2$f, kv, null)
  };
  foreach__F1__V(f) {
    /*<skip>*/
  };
  updated__O__O__sci_HashMap(key, value) {
    return this.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(key, this.computeHash__O__I(key), 0, value, null, null)
  };
  empty__sc_Map() {
    $m_sci_HashMap$();
    return $m_sci_HashMap$EmptyHashMap$()
  };
  empty__sci_Map() {
    $m_sci_HashMap$();
    return $m_sci_HashMap$EmptyHashMap$()
  };
  size__I() {
    return 0
  };
  seq__sc_Map() {
    return this
  };
  iterator__sc_Iterator() {
    return $m_sc_Iterator$().empty$1
  };
  improve__I__I(hcode) {
    let h = ((hcode + (~(hcode << 9))) | 0);
    h = (h ^ ((h >>> 14) | 0));
    h = ((h + (h << 4)) | 0);
    return (h ^ ((h >>> 10) | 0))
  };
  get__O__s_Option(key) {
    return this.get0__O__I__I__s_Option(key, this.computeHash__O__I(key), 0)
  };
  contains0__O__I__I__Z(key, hash, level) {
    return false
  };
  contains__O__Z(key) {
    return this.contains0__O__I__I__Z(key, this.computeHash__O__I(key), 0)
  };
  $$plus__T2__sc_GenMap(kv) {
    return this.$$plus__T2__sci_HashMap(kv)
  };
}
const $d_sci_HashMap = new $TypeData().initClass({
  sci_HashMap: 0
}, false, "scala.collection.immutable.HashMap", {
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
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
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap.prototype.$classData = $d_sci_HashMap;
class $c_sci_HashSet$HashSet1 extends $c_sci_HashSet$LeafHashSet {
  constructor() {
    super();
    this.key$6 = null;
    this.hash$6 = 0
  };
  updated0__O__I__I__sci_HashSet(key, hash, level) {
    if (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))) {
      return this
    } else if ((hash !== this.hash$6)) {
      return $m_sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new $c_sci_HashSet$HashSet1().init___O__I(key, hash), level)
    } else {
      const this$2 = $m_sci_ListSet$EmptyListSet$();
      const elem = this.key$6;
      return new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, new $c_sci_ListSet$Node().init___sci_ListSet__O(this$2, elem).$$plus__O__sci_ListSet(key))
    }
  };
  init___O__I(key, hash) {
    this.key$6 = key;
    this.hash$6 = hash;
    return this
  };
  foreach__F1__V(f) {
    f.apply__O__O(this.key$6)
  };
  iterator__sc_Iterator() {
    $m_sc_Iterator$();
    const elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.key$6]);
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, (elems.array$6.length | 0))
  };
  size__I() {
    return 1
  };
  get0__O__I__I__Z(key, hash, level) {
    return ((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))
  };
  subsetOf0__sci_HashSet__I__Z(that, level) {
    return that.get0__O__I__I__Z(this.key$6, this.hash$6, level)
  };
}
const $is_sci_HashSet$HashSet1 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashSet1)))
});
const $isArrayOf_sci_HashSet$HashSet1 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashSet1)))
});
const $d_sci_HashSet$HashSet1 = new $TypeData().initClass({
  sci_HashSet$HashSet1: 0
}, false, "scala.collection.immutable.HashSet$HashSet1", {
  sci_HashSet$HashSet1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
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
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashSet1.prototype.$classData = $d_sci_HashSet$HashSet1;
class $c_sci_HashSet$HashSetCollision1 extends $c_sci_HashSet$LeafHashSet {
  constructor() {
    super();
    this.hash$6 = 0;
    this.ks$6 = null
  };
  updated0__O__I__I__sci_HashSet(key, hash, level) {
    return ((hash === this.hash$6) ? new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, this.ks$6.$$plus__O__sci_ListSet(key)) : $m_sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new $c_sci_HashSet$HashSet1().init___O__I(key, hash), level))
  };
  foreach__F1__V(f) {
    const this$1 = this.ks$6;
    const this$2 = this$1.reverseList$1__p4__sci_List();
    const this$3 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2);
    $f_sc_Iterator__foreach__F1__V(this$3, f)
  };
  iterator__sc_Iterator() {
    const this$1 = this.ks$6;
    const this$2 = this$1.reverseList$1__p4__sci_List();
    return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2)
  };
  size__I() {
    return this.ks$6.size__I()
  };
  init___I__sci_ListSet(hash, ks) {
    this.hash$6 = hash;
    this.ks$6 = ks;
    return this
  };
  get0__O__I__I__Z(key, hash, level) {
    return ((hash === this.hash$6) && this.ks$6.contains__O__Z(key))
  };
  subsetOf0__sci_HashSet__I__Z(that, level) {
    const this$1 = this.ks$6;
    const this$2 = this$1.reverseList$1__p4__sci_List();
    const this$3 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2);
    let res = true;
    while ((res && this$3.hasNext__Z())) {
      const arg1 = this$3.next__O();
      res = that.get0__O__I__I__Z(arg1, this.hash$6, level)
    };
    return res
  };
}
const $d_sci_HashSet$HashSetCollision1 = new $TypeData().initClass({
  sci_HashSet$HashSetCollision1: 0
}, false, "scala.collection.immutable.HashSet$HashSetCollision1", {
  sci_HashSet$HashSetCollision1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
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
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashSetCollision1.prototype.$classData = $d_sci_HashSet$HashSetCollision1;
class $c_sci_ListMap$EmptyListMap$ extends $c_sci_ListMap {
  init___() {
    return this
  };
}
const $d_sci_ListMap$EmptyListMap$ = new $TypeData().initClass({
  sci_ListMap$EmptyListMap$: 0
}, false, "scala.collection.immutable.ListMap$EmptyListMap$", {
  sci_ListMap$EmptyListMap$: 1,
  sci_ListMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
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
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListMap$EmptyListMap$.prototype.$classData = $d_sci_ListMap$EmptyListMap$;
let $n_sci_ListMap$EmptyListMap$ = (void 0);
const $m_sci_ListMap$EmptyListMap$ = (function() {
  if ((!$n_sci_ListMap$EmptyListMap$)) {
    $n_sci_ListMap$EmptyListMap$ = new $c_sci_ListMap$EmptyListMap$().init___()
  };
  return $n_sci_ListMap$EmptyListMap$
});
class $c_sci_ListMap$Node extends $c_sci_ListMap {
  constructor() {
    super();
    this.key$6 = null;
    this.value$6 = null;
    this.$$outer$6 = null
  };
  removeInternal__p6__O__sci_ListMap__sci_List__sci_ListMap(k, cur, acc) {
    _removeInternal: while (true) {
      if (cur.isEmpty__Z()) {
        const this$1 = acc;
        return $f_sc_LinearSeqOptimized__last__O(this$1)
      } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
        const x$5 = cur.next__sci_ListMap();
        const this$2 = acc;
        let acc$1 = x$5;
        let these = this$2;
        while ((!these.isEmpty__Z())) {
          const arg1 = acc$1;
          const arg2 = these.head__O();
          const x0$1 = arg1;
          const x1$1 = arg2;
          acc$1 = new $c_sci_ListMap$Node().init___sci_ListMap__O__O(x0$1, x1$1.key__O(), x1$1.value__O());
          these = these.tail__O()
        };
        return acc$1
      } else {
        const temp$cur = cur.next__sci_ListMap();
        const x$6 = cur;
        const this$3 = acc;
        const temp$acc = new $c_sci_$colon$colon().init___O__sci_List(x$6, this$3);
        cur = temp$cur;
        acc = temp$acc;
        continue _removeInternal
      }
    }
  };
  apply__O__O(k) {
    return this.applyInternal__p6__sci_ListMap__O__O(this, k)
  };
  value__O() {
    return this.value$6
  };
  isEmpty__Z() {
    return false
  };
  applyInternal__p6__sci_ListMap__O__O(cur, k) {
    _applyInternal: while (true) {
      if (cur.isEmpty__Z()) {
        throw new $c_ju_NoSuchElementException().init___T(("key not found: " + k))
      } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
        return cur.value__O()
      } else {
        cur = cur.next__sci_ListMap();
        continue _applyInternal
      }
    }
  };
  getInternal__p6__sci_ListMap__O__s_Option(cur, k) {
    _getInternal: while (true) {
      if (cur.isEmpty__Z()) {
        return $m_s_None$()
      } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
        return new $c_s_Some().init___O(cur.value__O())
      } else {
        cur = cur.next__sci_ListMap();
        continue _getInternal
      }
    }
  };
  sizeInternal__p6__sci_ListMap__I__I(cur, acc) {
    _sizeInternal: while (true) {
      if (cur.isEmpty__Z()) {
        return acc
      } else {
        const temp$cur = cur.next__sci_ListMap();
        const temp$acc = ((1 + acc) | 0);
        cur = temp$cur;
        acc = temp$acc;
        continue _sizeInternal
      }
    }
  };
  size__I() {
    return this.sizeInternal__p6__sci_ListMap__I__I(this, 0)
  };
  key__O() {
    return this.key$6
  };
  $$plus__T2__sci_ListMap(kv) {
    const k = kv.$$und1$f;
    const m = this.removeInternal__p6__O__sci_ListMap__sci_List__sci_ListMap(k, this, $m_sci_Nil$());
    return new $c_sci_ListMap$Node().init___sci_ListMap__O__O(m, kv.$$und1$f, kv.$$und2$f)
  };
  updated__O__O__sci_ListMap(k, v) {
    const m = this.removeInternal__p6__O__sci_ListMap__sci_List__sci_ListMap(k, this, $m_sci_Nil$());
    return new $c_sci_ListMap$Node().init___sci_ListMap__O__O(m, k, v)
  };
  get__O__s_Option(k) {
    return this.getInternal__p6__sci_ListMap__O__s_Option(this, k)
  };
  contains__O__Z(k) {
    return this.containsInternal__p6__sci_ListMap__O__Z(this, k)
  };
  init___sci_ListMap__O__O($$outer, key, value) {
    this.key$6 = key;
    this.value$6 = value;
    if (($$outer === null)) {
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
    } else {
      this.$$outer$6 = $$outer
    };
    return this
  };
  containsInternal__p6__sci_ListMap__O__Z(cur, k) {
    _containsInternal: while (true) {
      if ((!cur.isEmpty__Z())) {
        if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
          return true
        } else {
          cur = cur.next__sci_ListMap();
          continue _containsInternal
        }
      } else {
        return false
      }
    }
  };
  next__sci_ListMap() {
    return this.$$outer$6
  };
  $$plus__T2__sc_GenMap(kv) {
    return this.$$plus__T2__sci_ListMap(kv)
  };
}
const $d_sci_ListMap$Node = new $TypeData().initClass({
  sci_ListMap$Node: 0
}, false, "scala.collection.immutable.ListMap$Node", {
  sci_ListMap$Node: 1,
  sci_ListMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
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
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListMap$Node.prototype.$classData = $d_sci_ListMap$Node;
class $c_sci_Stream extends $c_sc_AbstractSeq {
  seq__sc_TraversableOnce() {
    return this
  };
  lengthCompare__I__I(len) {
    return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this, len)
  };
  apply__O__O(v1) {
    const n = (v1 | 0);
    return $f_sc_LinearSeqOptimized__apply__I__O(this, n)
  };
  sameElements__sc_GenIterable__Z(that) {
    return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
  };
  thisCollection__sc_Traversable() {
    return this
  };
  equals__O__Z(that) {
    return ((this === that) || $f_sc_GenSeqLike__equals__O__Z(this, that))
  };
  flatMap__F1__scg_CanBuildFrom__O(f, bf) {
    if ($is_sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
      let x$1;
      if (this.isEmpty__Z()) {
        x$1 = $m_sci_Stream$Empty$()
      } else {
        const nonEmptyPrefix = new $c_sr_ObjectRef().init___O(this);
        let prefix = f.apply__O__O(nonEmptyPrefix.elem$1.head__O()).toStream__sci_Stream();
        while (((!nonEmptyPrefix.elem$1.isEmpty__Z()) && prefix.isEmpty__Z())) {
          nonEmptyPrefix.elem$1 = nonEmptyPrefix.elem$1.tail__O();
          if ((!nonEmptyPrefix.elem$1.isEmpty__Z())) {
            prefix = f.apply__O__O(nonEmptyPrefix.elem$1.head__O()).toStream__sci_Stream()
          }
        };
        x$1 = (nonEmptyPrefix.elem$1.isEmpty__Z() ? ($m_sci_Stream$(), $m_sci_Stream$Empty$()) : prefix.append__F0__sci_Stream(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, f$1, nonEmptyPrefix$1) {
          return (function() {
            const x = nonEmptyPrefix$1.elem$1.tail__O().flatMap__F1__scg_CanBuildFrom__O(f$1, ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___()));
            return x
          })
        })(this, f, nonEmptyPrefix))))
      };
      return x$1
    } else {
      return $f_sc_TraversableLike__flatMap__F1__scg_CanBuildFrom__O(this, f, bf)
    }
  };
  drop__I__sc_LinearSeqOptimized(n) {
    return this.drop__I__sci_Stream(n)
  };
  mkString__T__T__T__T(start, sep, end) {
    this.force__sci_Stream();
    return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
  };
  mkString__T__T(sep) {
    return this.mkString__T__T__T__T("", sep, "")
  };
  toString__T() {
    return $f_sc_TraversableOnce__mkString__T__T__T__T(this, "Stream(", ", ", ")")
  };
  companion__scg_GenericCompanion() {
    return $m_sci_Stream$()
  };
  foreach__F1__V(f) {
    let _$this = this;
    _foreach: while (true) {
      if ((!_$this.isEmpty__Z())) {
        f.apply__O__O(_$this.head__O());
        _$this = _$this.tail__O();
        continue _foreach
      };
      break
    }
  };
  $$plus$colon__O__scg_CanBuildFrom__O(elem, bf) {
    if ($is_sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
      const tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
        return (function() {
          return $this
        })
      })(this));
      const x = new $c_sci_Stream$Cons().init___O__F0(elem, tl);
      return x
    } else {
      return $f_sc_SeqLike__$$plus$colon__O__scg_CanBuildFrom__O(this, elem, bf)
    }
  };
  iterator__sc_Iterator() {
    return new $c_sci_StreamIterator().init___sci_Stream(this)
  };
  seq__sc_Seq() {
    return this
  };
  length__I() {
    let len = 0;
    let left = this;
    while ((!left.isEmpty__Z())) {
      len = ((1 + len) | 0);
      left = left.tail__O()
    };
    return len
  };
  $$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(that, bf) {
    if ($is_sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
      let x$1;
      if (this.isEmpty__Z()) {
        x$1 = that.toStream__sci_Stream()
      } else {
        const hd = this.head__O();
        const tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, that$1) {
          return (function() {
            const x = $this.tail__O().$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(that$1, ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___()));
            return x
          })
        })(this, that));
        x$1 = new $c_sci_Stream$Cons().init___O__F0(hd, tl)
      };
      return x$1
    } else {
      return $f_sc_TraversableLike__$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(this, that, bf)
    }
  };
  take__I__O(n) {
    return this.take__I__sci_Stream(n)
  };
  toStream__sci_Stream() {
    return this
  };
  thisCollection__sc_Seq() {
    return this
  };
  drop__I__sci_Stream(n) {
    let _$this = this;
    _drop: while (true) {
      if (((n <= 0) || _$this.isEmpty__Z())) {
        return _$this
      } else {
        const temp$_$this = _$this.tail__O();
        const temp$n = (((-1) + n) | 0);
        _$this = temp$_$this;
        n = temp$n;
        continue _drop
      }
    }
  };
  addString__scm_StringBuilder__T__T__T__scm_StringBuilder(b, start, sep, end) {
    b.append__T__scm_StringBuilder(start);
    if ((!this.isEmpty__Z())) {
      b.append__O__scm_StringBuilder(this.head__O());
      let cursor = this;
      let n = 1;
      if (cursor.tailDefined__Z()) {
        let scout = this.tail__O();
        if (scout.isEmpty__Z()) {
          b.append__T__scm_StringBuilder(end);
          return b
        };
        if ((cursor !== scout)) {
          cursor = scout;
          if (scout.tailDefined__Z()) {
            scout = scout.tail__O();
            while (((cursor !== scout) && scout.tailDefined__Z())) {
              b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
              n = ((1 + n) | 0);
              cursor = cursor.tail__O();
              scout = scout.tail__O();
              if (scout.tailDefined__Z()) {
                scout = scout.tail__O()
              }
            }
          }
        };
        if ((!scout.tailDefined__Z())) {
          while ((cursor !== scout)) {
            b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
            n = ((1 + n) | 0);
            cursor = cursor.tail__O()
          };
          const this$1 = cursor;
          if ($f_sc_TraversableOnce__nonEmpty__Z(this$1)) {
            b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O())
          }
        } else {
          let runner = this;
          let k = 0;
          while ((runner !== scout)) {
            runner = runner.tail__O();
            scout = scout.tail__O();
            k = ((1 + k) | 0)
          };
          if (((cursor === scout) && (k > 0))) {
            b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
            n = ((1 + n) | 0);
            cursor = cursor.tail__O()
          };
          while ((cursor !== scout)) {
            b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
            n = ((1 + n) | 0);
            cursor = cursor.tail__O()
          };
          n = ((n - k) | 0)
        }
      };
      if ((!cursor.isEmpty__Z())) {
        if ((!cursor.tailDefined__Z())) {
          b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("?")
        } else {
          b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("...")
        }
      }
    };
    b.append__T__scm_StringBuilder(end);
    return b
  };
  force__sci_Stream() {
    let these = this;
    let those = this;
    if ((!these.isEmpty__Z())) {
      these = these.tail__O()
    };
    while ((those !== these)) {
      if (these.isEmpty__Z()) {
        return this
      };
      these = these.tail__O();
      if (these.isEmpty__Z()) {
        return this
      };
      these = these.tail__O();
      if ((these === those)) {
        return this
      };
      those = those.tail__O()
    };
    return this
  };
  isDefinedAt__O__Z(x) {
    const x$1 = (x | 0);
    return $f_sc_LinearSeqOptimized__isDefinedAt__I__Z(this, x$1)
  };
  hashCode__I() {
    return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
  };
  take__I__sci_Stream(n) {
    if (((n <= 0) || this.isEmpty__Z())) {
      $m_sci_Stream$();
      return $m_sci_Stream$Empty$()
    } else if ((n === 1)) {
      const hd = this.head__O();
      const tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
        return (function() {
          $m_sci_Stream$();
          return $m_sci_Stream$Empty$()
        })
      })(this));
      return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
    } else {
      const hd$1 = this.head__O();
      const tl$1 = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2$1, n$1) {
        return (function() {
          return this$2$1.tail__O().take__I__sci_Stream((((-1) + n$1) | 0))
        })
      })(this, n));
      return new $c_sci_Stream$Cons().init___O__F0(hd$1, tl$1)
    }
  };
  append__F0__sci_Stream(rest) {
    if (this.isEmpty__Z()) {
      return rest.apply__O().toStream__sci_Stream()
    } else {
      const hd = this.head__O();
      const tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, rest$1) {
        return (function() {
          return $this.tail__O().append__F0__sci_Stream(rest$1)
        })
      })(this, rest));
      return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
    }
  };
  stringPrefix__T() {
    return "Stream"
  };
}
const $is_sci_Stream = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream)))
});
const $isArrayOf_sci_Stream = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream)))
});
const $f_scm_ResizableArray__apply__I__O = (function($thiz, idx) {
  if ((idx >= $thiz.size0$6)) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + idx))
  };
  return $thiz.array$6.u[idx]
});
const $f_scm_ResizableArray__foreach__F1__V = (function($thiz, f) {
  let i = 0;
  const top = $thiz.size0$6;
  while ((i < top)) {
    f.apply__O__O($thiz.array$6.u[i]);
    i = ((1 + i) | 0)
  }
});
const $f_scm_ResizableArray__ensureSize__I__V = (function($thiz, n) {
  const value = $thiz.array$6.u.length;
  const hi = (value >> 31);
  const hi$1 = (n >> 31);
  if (((hi$1 === hi) ? (((-2147483648) ^ n) > ((-2147483648) ^ value)) : (hi$1 > hi))) {
    const lo = (value << 1);
    const hi$2 = (((value >>> 31) | 0) | (hi << 1));
    let newSize_$_lo$2 = lo;
    let newSize_$_hi$2 = hi$2;
    while (true) {
      const hi$3 = (n >> 31);
      const b_$_lo$2 = newSize_$_lo$2;
      const b_$_hi$2 = newSize_$_hi$2;
      const bhi = b_$_hi$2;
      if (((hi$3 === bhi) ? (((-2147483648) ^ n) > ((-2147483648) ^ b_$_lo$2)) : (hi$3 > bhi))) {
        const this$1_$_lo$2 = newSize_$_lo$2;
        const this$1_$_hi$2 = newSize_$_hi$2;
        const lo$1 = (this$1_$_lo$2 << 1);
        const hi$4 = (((this$1_$_lo$2 >>> 31) | 0) | (this$1_$_hi$2 << 1));
        const jsx$1_$_lo$2 = lo$1;
        const jsx$1_$_hi$2 = hi$4;
        newSize_$_lo$2 = jsx$1_$_lo$2;
        newSize_$_hi$2 = jsx$1_$_hi$2
      } else {
        break
      }
    };
    const this$2_$_lo$2 = newSize_$_lo$2;
    const this$2_$_hi$2 = newSize_$_hi$2;
    const ahi = this$2_$_hi$2;
    if (((ahi === 0) ? (((-2147483648) ^ this$2_$_lo$2) > (-1)) : (ahi > 0))) {
      const jsx$2_$_lo$2 = 2147483647;
      const jsx$2_$_hi$2 = 0;
      newSize_$_lo$2 = jsx$2_$_lo$2;
      newSize_$_hi$2 = jsx$2_$_hi$2
    };
    const this$3_$_lo$2 = newSize_$_lo$2;
    const this$3_$_hi$2 = newSize_$_hi$2;
    const newArray = $newArrayObject($d_O.getArrayOf(), [this$3_$_lo$2]);
    $systemArraycopy($thiz.array$6, 0, newArray, 0, $thiz.size0$6);
    $thiz.array$6 = newArray
  }
});
const $f_scm_ResizableArray__$$init$__V = (function($thiz) {
  const x = $thiz.initialSize$6;
  $thiz.array$6 = $newArrayObject($d_O.getArrayOf(), [((x > 1) ? x : 1)]);
  $thiz.size0$6 = 0
});
const $f_scm_ResizableArray__copyToArray__O__I__I__V = (function($thiz, xs, start, len) {
  const that = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  const x = ((len < that) ? len : that);
  const that$1 = $thiz.size0$6;
  const len1 = ((x < that$1) ? x : that$1);
  if ((len1 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V($thiz.array$6, 0, xs, start, len1)
  }
});
class $c_sci_HashMap$EmptyHashMap$ extends $c_sci_HashMap {
  init___() {
    return this
  };
}
const $d_sci_HashMap$EmptyHashMap$ = new $TypeData().initClass({
  sci_HashMap$EmptyHashMap$: 0
}, false, "scala.collection.immutable.HashMap$EmptyHashMap$", {
  sci_HashMap$EmptyHashMap$: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
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
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$EmptyHashMap$.prototype.$classData = $d_sci_HashMap$EmptyHashMap$;
let $n_sci_HashMap$EmptyHashMap$ = (void 0);
const $m_sci_HashMap$EmptyHashMap$ = (function() {
  if ((!$n_sci_HashMap$EmptyHashMap$)) {
    $n_sci_HashMap$EmptyHashMap$ = new $c_sci_HashMap$EmptyHashMap$().init___()
  };
  return $n_sci_HashMap$EmptyHashMap$
});
class $c_sci_HashMap$HashMap1 extends $c_sci_HashMap {
  constructor() {
    super();
    this.key$6 = null;
    this.hash$6 = 0;
    this.value$6 = null;
    this.kv$6 = null
  };
  ensurePair__T2() {
    if ((this.kv$6 !== null)) {
      return this.kv$6
    } else {
      this.kv$6 = new $c_T2().init___O__O(this.key$6, this.value$6);
      return this.kv$6
    }
  };
  init___O__I__O__T2(key, hash, value, kv) {
    this.key$6 = key;
    this.hash$6 = hash;
    this.value$6 = value;
    this.kv$6 = kv;
    return this
  };
  updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(key, hash, level, value, kv, merger) {
    if (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))) {
      if ((merger === null)) {
        return ((this.value$6 === value) ? this : new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv))
      } else {
        const nkv = merger.apply__T2__T2__T2(this.ensurePair__T2(), ((kv !== null) ? kv : new $c_T2().init___O__O(key, value)));
        return new $c_sci_HashMap$HashMap1().init___O__I__O__T2(nkv.$$und1$f, hash, nkv.$$und2$f, nkv)
      }
    } else if ((hash !== this.hash$6)) {
      const that = new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv);
      return $m_sci_HashMap$().scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(this.hash$6, this, hash, that, level, 2)
    } else {
      const this$2 = $m_sci_ListMap$EmptyListMap$();
      const key$1 = this.key$6;
      const value$1 = this.value$6;
      return new $c_sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, new $c_sci_ListMap$Node().init___sci_ListMap__O__O(this$2, key$1, value$1).updated__O__O__sci_ListMap(key, value))
    }
  };
  get0__O__I__I__s_Option(key, hash, level) {
    return (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6)) ? new $c_s_Some().init___O(this.value$6) : $m_s_None$())
  };
  foreach__F1__V(f) {
    f.apply__O__O(this.ensurePair__T2())
  };
  size__I() {
    return 1
  };
  iterator__sc_Iterator() {
    $m_sc_Iterator$();
    const elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.ensurePair__T2()]);
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, (elems.array$6.length | 0))
  };
  contains0__O__I__I__Z(key, hash, level) {
    return ((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))
  };
}
const $is_sci_HashMap$HashMap1 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashMap1)))
});
const $isArrayOf_sci_HashMap$HashMap1 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashMap1)))
});
const $d_sci_HashMap$HashMap1 = new $TypeData().initClass({
  sci_HashMap$HashMap1: 0
}, false, "scala.collection.immutable.HashMap$HashMap1", {
  sci_HashMap$HashMap1: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
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
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$HashMap1.prototype.$classData = $d_sci_HashMap$HashMap1;
class $c_sci_HashMap$HashMapCollision1 extends $c_sci_HashMap {
  constructor() {
    super();
    this.hash$6 = 0;
    this.kvs$6 = null
  };
  updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(key, hash, level, value, kv, merger) {
    if ((hash === this.hash$6)) {
      return (((merger === null) || (!this.kvs$6.contains__O__Z(key))) ? new $c_sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, this.kvs$6.updated__O__O__sci_ListMap(key, value)) : new $c_sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, this.kvs$6.$$plus__T2__sci_ListMap(merger.apply__T2__T2__T2(new $c_T2().init___O__O(key, this.kvs$6.apply__O__O(key)), kv))))
    } else {
      const that = new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv);
      return $m_sci_HashMap$().scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(this.hash$6, this, hash, that, level, ((1 + this.kvs$6.size__I()) | 0))
    }
  };
  get0__O__I__I__s_Option(key, hash, level) {
    return ((hash === this.hash$6) ? this.kvs$6.get__O__s_Option(key) : $m_s_None$())
  };
  foreach__F1__V(f) {
    const this$1 = this.kvs$6;
    const this$2 = this$1.reverseList$1__p5__sci_List();
    const this$3 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2);
    $f_sc_Iterator__foreach__F1__V(this$3, f)
  };
  iterator__sc_Iterator() {
    const this$1 = this.kvs$6;
    const this$2 = this$1.reverseList$1__p5__sci_List();
    return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2)
  };
  size__I() {
    return this.kvs$6.size__I()
  };
  init___I__sci_ListMap(hash, kvs) {
    this.hash$6 = hash;
    this.kvs$6 = kvs;
    return this
  };
  contains0__O__I__I__Z(key, hash, level) {
    return ((hash === this.hash$6) && this.kvs$6.contains__O__Z(key))
  };
}
const $d_sci_HashMap$HashMapCollision1 = new $TypeData().initClass({
  sci_HashMap$HashMapCollision1: 0
}, false, "scala.collection.immutable.HashMap$HashMapCollision1", {
  sci_HashMap$HashMapCollision1: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
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
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$HashMapCollision1.prototype.$classData = $d_sci_HashMap$HashMapCollision1;
class $c_sci_HashMap$HashTrieMap extends $c_sci_HashMap {
  constructor() {
    super();
    this.bitmap$6 = 0;
    this.elems$6 = null;
    this.size0$6 = 0
  };
  updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(key, hash, level, value, kv, merger) {
    const index = (31 & ((hash >>> level) | 0));
    const mask = (1 << index);
    const offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$6 & (((-1) + mask) | 0)));
    if (((this.bitmap$6 & mask) !== 0)) {
      const sub = this.elems$6.u[offset];
      const subNew = sub.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(key, hash, ((5 + level) | 0), value, kv, merger);
      if ((subNew === sub)) {
        return this
      } else {
        const elemsNew = $newArrayObject($d_sci_HashMap.getArrayOf(), [this.elems$6.u.length]);
        $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, 0, elemsNew, 0, this.elems$6.u.length);
        elemsNew.u[offset] = subNew;
        return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(this.bitmap$6, elemsNew, ((this.size0$6 + ((subNew.size__I() - sub.size__I()) | 0)) | 0))
      }
    } else {
      const elemsNew$2 = $newArrayObject($d_sci_HashMap.getArrayOf(), [((1 + this.elems$6.u.length) | 0)]);
      $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, 0, elemsNew$2, 0, offset);
      elemsNew$2.u[offset] = new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv);
      $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, offset, elemsNew$2, ((1 + offset) | 0), ((this.elems$6.u.length - offset) | 0));
      return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I((this.bitmap$6 | mask), elemsNew$2, ((1 + this.size0$6) | 0))
    }
  };
  get0__O__I__I__s_Option(key, hash, level) {
    const index = (31 & ((hash >>> level) | 0));
    if ((this.bitmap$6 === (-1))) {
      return this.elems$6.u[index].get0__O__I__I__s_Option(key, hash, ((5 + level) | 0))
    } else {
      const mask = (1 << index);
      if (((this.bitmap$6 & mask) !== 0)) {
        const offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$6 & (((-1) + mask) | 0)));
        return this.elems$6.u[offset].get0__O__I__I__s_Option(key, hash, ((5 + level) | 0))
      } else {
        return $m_s_None$()
      }
    }
  };
  foreach__F1__V(f) {
    let i = 0;
    while ((i < this.elems$6.u.length)) {
      this.elems$6.u[i].foreach__F1__V(f);
      i = ((1 + i) | 0)
    }
  };
  iterator__sc_Iterator() {
    return new $c_sci_HashMap$HashTrieMap$$anon$1().init___sci_HashMap$HashTrieMap(this)
  };
  size__I() {
    return this.size0$6
  };
  init___I__Asci_HashMap__I(bitmap, elems, size0) {
    this.bitmap$6 = bitmap;
    this.elems$6 = elems;
    this.size0$6 = size0;
    return this
  };
  contains0__O__I__I__Z(key, hash, level) {
    const index = (31 & ((hash >>> level) | 0));
    if ((this.bitmap$6 === (-1))) {
      return this.elems$6.u[index].contains0__O__I__I__Z(key, hash, ((5 + level) | 0))
    } else {
      const mask = (1 << index);
      if (((this.bitmap$6 & mask) !== 0)) {
        const offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$6 & (((-1) + mask) | 0)));
        return this.elems$6.u[offset].contains0__O__I__I__Z(key, hash, ((5 + level) | 0))
      } else {
        return false
      }
    }
  };
}
const $is_sci_HashMap$HashTrieMap = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashTrieMap)))
});
const $isArrayOf_sci_HashMap$HashTrieMap = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashTrieMap)))
});
const $d_sci_HashMap$HashTrieMap = new $TypeData().initClass({
  sci_HashMap$HashTrieMap: 0
}, false, "scala.collection.immutable.HashMap$HashTrieMap", {
  sci_HashMap$HashTrieMap: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
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
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$HashTrieMap.prototype.$classData = $d_sci_HashMap$HashTrieMap;
class $c_sci_List extends $c_sc_AbstractSeq {
  seq__sc_TraversableOnce() {
    return this
  };
  lengthCompare__I__I(len) {
    return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this, len)
  };
  apply__O__O(v1) {
    const n = (v1 | 0);
    return $f_sc_LinearSeqOptimized__apply__I__O(this, n)
  };
  sameElements__sc_GenIterable__Z(that) {
    return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
  };
  toList__sci_List() {
    return this
  };
  thisCollection__sc_Traversable() {
    return this
  };
  drop__I__sc_LinearSeqOptimized(n) {
    return this.drop__I__sci_List(n)
  };
  take__I__sci_List(n) {
    if ((this.isEmpty__Z() || (n <= 0))) {
      return $m_sci_Nil$()
    } else {
      const h = new $c_sci_$colon$colon().init___O__sci_List(this.head__O(), $m_sci_Nil$());
      let t = h;
      let rest = this.tail__sci_List();
      let i = 1;
      while (true) {
        if (rest.isEmpty__Z()) {
          return this
        };
        if ((i < n)) {
          i = ((1 + i) | 0);
          const nx = new $c_sci_$colon$colon().init___O__sci_List(rest.head__O(), $m_sci_Nil$());
          t.tl$5 = nx;
          t = nx;
          const this$1 = rest;
          rest = this$1.tail__sci_List()
        } else {
          break
        }
      };
      return h
    }
  };
  companion__scg_GenericCompanion() {
    return $m_sci_List$()
  };
  foreach__F1__V(f) {
    let these = this;
    while ((!these.isEmpty__Z())) {
      f.apply__O__O(these.head__O());
      const this$1 = these;
      these = this$1.tail__sci_List()
    }
  };
  $$colon$colon$colon__sci_List__sci_List(prefix) {
    return (this.isEmpty__Z() ? prefix : (prefix.isEmpty__Z() ? this : new $c_scm_ListBuffer().init___().$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(prefix).prependToList__sci_List__sci_List(this)))
  };
  $$plus$colon__O__scg_CanBuildFrom__O(elem, bf) {
    return ($is_scg_GenTraversableFactory$GenericCanBuildFrom(bf) ? new $c_sci_$colon$colon().init___O__sci_List(elem, this) : $f_sc_SeqLike__$$plus$colon__O__scg_CanBuildFrom__O(this, elem, bf))
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
  seq__sc_Seq() {
    return this
  };
  length__I() {
    return $f_sc_LinearSeqOptimized__length__I(this)
  };
  $$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(that, bf) {
    return ((bf === $m_sci_List$().ReusableCBFInstance$2) ? that.seq__sc_TraversableOnce().toList__sci_List().$$colon$colon$colon__sci_List__sci_List(this) : $f_sc_TraversableLike__$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(this, that, bf))
  };
  take__I__O(n) {
    return this.take__I__sci_List(n)
  };
  toStream__sci_Stream() {
    return (this.isEmpty__Z() ? $m_sci_Stream$Empty$() : new $c_sci_Stream$Cons().init___O__F0(this.head__O(), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
      return (function() {
        return $this.tail__sci_List().toStream__sci_Stream()
      })
    })(this))))
  };
  thisCollection__sc_Seq() {
    return this
  };
  isDefinedAt__O__Z(x) {
    const x$1 = (x | 0);
    return $f_sc_LinearSeqOptimized__isDefinedAt__I__Z(this, x$1)
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
class $c_sci_Stream$Cons extends $c_sci_Stream {
  constructor() {
    super();
    this.hd$5 = null;
    this.tlVal$5 = null;
    this.tlGen$5 = null
  };
  head__O() {
    return this.hd$5
  };
  tail__sci_Stream() {
    if ((!this.tailDefined__Z())) {
      if ((!this.tailDefined__Z())) {
        this.tlVal$5 = this.tlGen$5.apply__O();
        this.tlGen$5 = null
      }
    };
    return this.tlVal$5
  };
  sameElements__sc_GenIterable__Z(that) {
    if ($is_sci_Stream$Cons(that)) {
      const x2 = that;
      return this.consEq$1__p5__sci_Stream$Cons__sci_Stream$Cons__Z(this, x2)
    } else {
      return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
    }
  };
  isEmpty__Z() {
    return false
  };
  tailDefined__Z() {
    return (this.tlGen$5 === null)
  };
  consEq$1__p5__sci_Stream$Cons__sci_Stream$Cons__Z(a, b) {
    _consEq: while (true) {
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(a.hd$5, b.hd$5)) {
        const x1 = a.tail__sci_Stream();
        if ($is_sci_Stream$Cons(x1)) {
          const x2 = x1;
          const x1$2 = b.tail__sci_Stream();
          if ($is_sci_Stream$Cons(x1$2)) {
            const x2$2 = x1$2;
            if ((x2 === x2$2)) {
              return true
            } else {
              a = x2;
              b = x2$2;
              continue _consEq
            }
          } else {
            return false
          }
        } else {
          return b.tail__sci_Stream().isEmpty__Z()
        }
      } else {
        return false
      }
    }
  };
  tail__O() {
    return this.tail__sci_Stream()
  };
  init___O__F0(hd, tl) {
    this.hd$5 = hd;
    this.tlGen$5 = tl;
    return this
  };
}
const $is_sci_Stream$Cons = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream$Cons)))
});
const $isArrayOf_sci_Stream$Cons = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream$Cons)))
});
const $d_sci_Stream$Cons = new $TypeData().initClass({
  sci_Stream$Cons: 0
}, false, "scala.collection.immutable.Stream$Cons", {
  sci_Stream$Cons: 1,
  sci_Stream: 1,
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
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Cons.prototype.$classData = $d_sci_Stream$Cons;
class $c_sci_Stream$Empty$ extends $c_sci_Stream {
  head__O() {
    this.head__sr_Nothing$()
  };
  init___() {
    return this
  };
  isEmpty__Z() {
    return true
  };
  tailDefined__Z() {
    return false
  };
  tail__sr_Nothing$() {
    throw new $c_jl_UnsupportedOperationException().init___T("tail of empty stream")
  };
  head__sr_Nothing$() {
    throw new $c_ju_NoSuchElementException().init___T("head of empty stream")
  };
  tail__O() {
    this.tail__sr_Nothing$()
  };
}
const $d_sci_Stream$Empty$ = new $TypeData().initClass({
  sci_Stream$Empty$: 0
}, false, "scala.collection.immutable.Stream$Empty$", {
  sci_Stream$Empty$: 1,
  sci_Stream: 1,
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
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Empty$.prototype.$classData = $d_sci_Stream$Empty$;
let $n_sci_Stream$Empty$ = (void 0);
const $m_sci_Stream$Empty$ = (function() {
  if ((!$n_sci_Stream$Empty$)) {
    $n_sci_Stream$Empty$ = new $c_sci_Stream$Empty$().init___()
  };
  return $n_sci_Stream$Empty$
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
  seq__sc_TraversableOnce() {
    return this
  };
  display3__AO() {
    return this.display3$4
  };
  gotoPosWritable__p4__I__I__I__V(oldIndex, newIndex, xor) {
    if (this.dirty$4) {
      $f_sci_VectorPointer__gotoPosWritable1__I__I__I__V(this, oldIndex, newIndex, xor)
    } else {
      $f_sci_VectorPointer__gotoPosWritable0__I__I__V(this, newIndex, xor);
      this.dirty$4 = true
    }
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
  thisCollection__sc_Traversable() {
    return this
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
  $$colon$plus__O__scg_CanBuildFrom__O(elem, bf) {
    return ((((bf === ($m_sci_IndexedSeq$(), $m_sc_IndexedSeq$().ReusableCBF$6)) || (bf === $m_sci_Seq$().ReusableCBFInstance$2)) || (bf === $m_sc_Seq$().ReusableCBFInstance$2)) ? this.appendBack__O__sci_Vector(elem) : $f_sc_SeqLike__$$colon$plus__O__scg_CanBuildFrom__O(this, elem, bf))
  };
  companion__scg_GenericCompanion() {
    return $m_sci_Vector$()
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
  shiftTopLevel__p4__I__I__V(oldLeft, newLeft) {
    const x1 = (((-1) + this.depth$4) | 0);
    switch (x1) {
      case 0: {
        const array = this.display0$4;
        this.display0$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array, oldLeft, newLeft);
        break
      }
      case 1: {
        const array$1 = this.display1$4;
        this.display1$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$1, oldLeft, newLeft);
        break
      }
      case 2: {
        const array$2 = this.display2$4;
        this.display2$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$2, oldLeft, newLeft);
        break
      }
      case 3: {
        const array$3 = this.display3$4;
        this.display3$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$3, oldLeft, newLeft);
        break
      }
      case 4: {
        const array$4 = this.display4$4;
        this.display4$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$4, oldLeft, newLeft);
        break
      }
      case 5: {
        const array$5 = this.display5$4;
        this.display5$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$5, oldLeft, newLeft);
        break
      }
      default: {
        throw new $c_s_MatchError().init___O(x1)
      }
    }
  };
  toVector__sci_Vector() {
    return this
  };
  appendBack__O__sci_Vector(value) {
    if ((this.endIndex$4 !== this.startIndex$4)) {
      const blockIndex = ((-32) & this.endIndex$4);
      const lo = (31 & this.endIndex$4);
      if ((this.endIndex$4 !== blockIndex)) {
        const s = new $c_sci_Vector().init___I__I__I(this.startIndex$4, ((1 + this.endIndex$4) | 0), blockIndex);
        const depth = this.depth$4;
        $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s, this, depth);
        s.dirty$4 = this.dirty$4;
        s.gotoPosWritable__p4__I__I__I__V(this.focus$4, blockIndex, (this.focus$4 ^ blockIndex));
        s.display0$4.u[lo] = value;
        return s
      } else {
        const shift = (this.startIndex$4 & (~(((-1) + (1 << $imul(5, (((-1) + this.depth$4) | 0)))) | 0)));
        const shiftBlocks = ((this.startIndex$4 >>> $imul(5, (((-1) + this.depth$4) | 0))) | 0);
        if ((shift !== 0)) {
          if ((this.depth$4 > 1)) {
            const newBlockIndex = ((blockIndex - shift) | 0);
            const newFocus = ((this.focus$4 - shift) | 0);
            const s$2 = new $c_sci_Vector().init___I__I__I(((this.startIndex$4 - shift) | 0), ((((1 + this.endIndex$4) | 0) - shift) | 0), newBlockIndex);
            const depth$1 = this.depth$4;
            $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s$2, this, depth$1);
            s$2.dirty$4 = this.dirty$4;
            s$2.shiftTopLevel__p4__I__I__V(shiftBlocks, 0);
            s$2.gotoFreshPosWritable__p4__I__I__I__V(newFocus, newBlockIndex, (newFocus ^ newBlockIndex));
            s$2.display0$4.u[lo] = value;
            return s$2
          } else {
            const newBlockIndex$2 = (((-32) + blockIndex) | 0);
            const newFocus$2 = this.focus$4;
            const s$3 = new $c_sci_Vector().init___I__I__I(((this.startIndex$4 - shift) | 0), ((((1 + this.endIndex$4) | 0) - shift) | 0), newBlockIndex$2);
            const depth$2 = this.depth$4;
            $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s$3, this, depth$2);
            s$3.dirty$4 = this.dirty$4;
            s$3.shiftTopLevel__p4__I__I__V(shiftBlocks, 0);
            s$3.gotoPosWritable__p4__I__I__I__V(newFocus$2, newBlockIndex$2, (newFocus$2 ^ newBlockIndex$2));
            s$3.display0$4.u[((32 - shift) | 0)] = value;
            return s$3
          }
        } else {
          const newFocus$3 = this.focus$4;
          const s$4 = new $c_sci_Vector().init___I__I__I(this.startIndex$4, ((1 + this.endIndex$4) | 0), blockIndex);
          const depth$3 = this.depth$4;
          $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s$4, this, depth$3);
          s$4.dirty$4 = this.dirty$4;
          s$4.gotoFreshPosWritable__p4__I__I__I__V(newFocus$3, blockIndex, (newFocus$3 ^ blockIndex));
          s$4.display0$4.u[lo] = value;
          return s$4
        }
      }
    } else {
      const elems = $newArrayObject($d_O.getArrayOf(), [32]);
      elems.u[0] = value;
      const s$5 = new $c_sci_Vector().init___I__I__I(0, 1, 0);
      s$5.depth$4 = 1;
      s$5.display0$4 = elems;
      return s$5
    }
  };
  $$plus$colon__O__scg_CanBuildFrom__O(elem, bf) {
    return ((((bf === ($m_sci_IndexedSeq$(), $m_sc_IndexedSeq$().ReusableCBF$6)) || (bf === $m_sci_Seq$().ReusableCBFInstance$2)) || (bf === $m_sc_Seq$().ReusableCBFInstance$2)) ? this.appendFront__O__sci_Vector(elem) : $f_sc_SeqLike__$$plus$colon__O__scg_CanBuildFrom__O(this, elem, bf))
  };
  iterator__sc_Iterator() {
    return this.iterator__sci_VectorIterator()
  };
  display1$und$eq__AO__V(x$1) {
    this.display1$4 = x$1
  };
  length__I() {
    return ((this.endIndex$4 - this.startIndex$4) | 0)
  };
  $$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(that, bf) {
    if ((((bf === ($m_sci_IndexedSeq$(), $m_sc_IndexedSeq$().ReusableCBF$6)) || (bf === $m_sci_Seq$().ReusableCBFInstance$2)) || (bf === $m_sc_Seq$().ReusableCBFInstance$2))) {
      if (that.isEmpty__Z()) {
        return this
      } else {
        const again = ((!that.isTraversableAgain__Z()) ? that.toVector__sci_Vector() : that.seq__sc_TraversableOnce());
        const x1 = again.size__I();
        switch (x1) {
          default: {
            if (((x1 <= 2) || (x1 < ((this.length__I() >>> 5) | 0)))) {
              const v = new $c_sr_ObjectRef().init___O(this);
              again.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, v$1) {
                return (function(x$2) {
                  v$1.elem$1 = v$1.elem$1.$$colon$plus__O__scg_CanBuildFrom__O(x$2, ($m_sci_Vector$(), $m_sc_IndexedSeq$().ReusableCBF$6))
                })
              })(this, v)));
              return v.elem$1
            } else if (((this.length__I() < ((x1 >>> 5) | 0)) && $is_sci_Vector(again))) {
              let v$2 = again;
              const ri = new $c_sci_Vector$$anon$1().init___sci_Vector(this);
              while (ri.hasNext__Z()) {
                const x$1 = ri.next__O();
                v$2 = v$2.$$plus$colon__O__scg_CanBuildFrom__O(x$1, ($m_sci_Vector$(), $m_sc_IndexedSeq$().ReusableCBF$6))
              };
              return v$2
            } else {
              return $f_sc_TraversableLike__$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(this, again, bf)
            }
          }
        }
      }
    } else {
      return $f_sc_TraversableLike__$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(this, that.seq__sc_TraversableOnce(), bf)
    }
  };
  seq__sc_Seq() {
    return this
  };
  display4$und$eq__AO__V(x$1) {
    this.display4$4 = x$1
  };
  sizeHintIfCheap__I() {
    return this.length__I()
  };
  gotoFreshPosWritable__p4__I__I__I__V(oldIndex, newIndex, xor) {
    if (this.dirty$4) {
      $f_sci_VectorPointer__gotoFreshPosWritable1__I__I__I__V(this, oldIndex, newIndex, xor)
    } else {
      $f_sci_VectorPointer__gotoFreshPosWritable0__I__I__I__V(this, oldIndex, newIndex, xor);
      this.dirty$4 = true
    }
  };
  display1__AO() {
    return this.display1$4
  };
  display5__AO() {
    return this.display5$4
  };
  thisCollection__sc_Seq() {
    return this
  };
  iterator__sci_VectorIterator() {
    const s = new $c_sci_VectorIterator().init___I__I(this.startIndex$4, this.endIndex$4);
    this.initIterator__sci_VectorIterator__V(s);
    return s
  };
  isDefinedAt__O__Z(x) {
    const idx = (x | 0);
    return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
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
  appendFront__O__sci_Vector(value) {
    if ((this.endIndex$4 !== this.startIndex$4)) {
      const blockIndex = ((-32) & (((-1) + this.startIndex$4) | 0));
      const lo = (31 & (((-1) + this.startIndex$4) | 0));
      if ((this.startIndex$4 !== ((32 + blockIndex) | 0))) {
        const s = new $c_sci_Vector().init___I__I__I((((-1) + this.startIndex$4) | 0), this.endIndex$4, blockIndex);
        const depth = this.depth$4;
        $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s, this, depth);
        s.dirty$4 = this.dirty$4;
        s.gotoPosWritable__p4__I__I__I__V(this.focus$4, blockIndex, (this.focus$4 ^ blockIndex));
        s.display0$4.u[lo] = value;
        return s
      } else {
        const freeSpace = (((1 << $imul(5, this.depth$4)) - this.endIndex$4) | 0);
        const shift = (freeSpace & (~(((-1) + (1 << $imul(5, (((-1) + this.depth$4) | 0)))) | 0)));
        const shiftBlocks = ((freeSpace >>> $imul(5, (((-1) + this.depth$4) | 0))) | 0);
        if ((shift !== 0)) {
          if ((this.depth$4 > 1)) {
            const newBlockIndex = ((blockIndex + shift) | 0);
            const newFocus = ((this.focus$4 + shift) | 0);
            const s$2 = new $c_sci_Vector().init___I__I__I((((((-1) + this.startIndex$4) | 0) + shift) | 0), ((this.endIndex$4 + shift) | 0), newBlockIndex);
            const depth$1 = this.depth$4;
            $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s$2, this, depth$1);
            s$2.dirty$4 = this.dirty$4;
            s$2.shiftTopLevel__p4__I__I__V(0, shiftBlocks);
            s$2.gotoFreshPosWritable__p4__I__I__I__V(newFocus, newBlockIndex, (newFocus ^ newBlockIndex));
            s$2.display0$4.u[lo] = value;
            return s$2
          } else {
            const newBlockIndex$2 = ((32 + blockIndex) | 0);
            const newFocus$2 = this.focus$4;
            const s$3 = new $c_sci_Vector().init___I__I__I((((((-1) + this.startIndex$4) | 0) + shift) | 0), ((this.endIndex$4 + shift) | 0), newBlockIndex$2);
            const depth$2 = this.depth$4;
            $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s$3, this, depth$2);
            s$3.dirty$4 = this.dirty$4;
            s$3.shiftTopLevel__p4__I__I__V(0, shiftBlocks);
            s$3.gotoPosWritable__p4__I__I__I__V(newFocus$2, newBlockIndex$2, (newFocus$2 ^ newBlockIndex$2));
            s$3.display0$4.u[(((-1) + shift) | 0)] = value;
            return s$3
          }
        } else if ((blockIndex < 0)) {
          const move = (((1 << $imul(5, ((1 + this.depth$4) | 0))) - (1 << $imul(5, this.depth$4))) | 0);
          const newBlockIndex$3 = ((blockIndex + move) | 0);
          const newFocus$3 = ((this.focus$4 + move) | 0);
          const s$4 = new $c_sci_Vector().init___I__I__I((((((-1) + this.startIndex$4) | 0) + move) | 0), ((this.endIndex$4 + move) | 0), newBlockIndex$3);
          const depth$3 = this.depth$4;
          $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s$4, this, depth$3);
          s$4.dirty$4 = this.dirty$4;
          s$4.gotoFreshPosWritable__p4__I__I__I__V(newFocus$3, newBlockIndex$3, (newFocus$3 ^ newBlockIndex$3));
          s$4.display0$4.u[lo] = value;
          return s$4
        } else {
          const newFocus$4 = this.focus$4;
          const s$5 = new $c_sci_Vector().init___I__I__I((((-1) + this.startIndex$4) | 0), this.endIndex$4, blockIndex);
          const depth$4 = this.depth$4;
          $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s$5, this, depth$4);
          s$5.dirty$4 = this.dirty$4;
          s$5.gotoFreshPosWritable__p4__I__I__I__V(newFocus$4, blockIndex, (newFocus$4 ^ blockIndex));
          s$5.display0$4.u[lo] = value;
          return s$5
        }
      }
    } else {
      const elems = $newArrayObject($d_O.getArrayOf(), [32]);
      elems.u[31] = value;
      const s$6 = new $c_sci_Vector().init___I__I__I(31, 32, 0);
      s$6.depth$4 = 1;
      s$6.display0$4 = elems;
      return s$6
    }
  };
  display3$und$eq__AO__V(x$1) {
    this.display3$4 = x$1
  };
}
const $is_sci_Vector = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Vector)))
});
const $isArrayOf_sci_Vector = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector)))
});
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
class $c_sci_WrappedString extends $c_sc_AbstractSeq {
  constructor() {
    super();
    this.self$4 = null
  };
  seq__sc_TraversableOnce() {
    return this
  };
  apply__I__O(idx) {
    const thiz = this.self$4;
    const c = (65535 & (thiz.charCodeAt(idx) | 0));
    return new $c_jl_Character().init___C(c)
  };
  lengthCompare__I__I(len) {
    return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
  };
  sameElements__sc_GenIterable__Z(that) {
    return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
  };
  apply__O__O(v1) {
    const n = (v1 | 0);
    const thiz = this.self$4;
    const c = (65535 & (thiz.charCodeAt(n) | 0));
    return new $c_jl_Character().init___C(c)
  };
  isEmpty__Z() {
    return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
  };
  thisCollection__sc_Traversable() {
    return this
  };
  companion__scg_GenericCompanion() {
    return $m_sci_IndexedSeq$()
  };
  toString__T() {
    return this.self$4
  };
  foreach__F1__V(f) {
    $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
  };
  iterator__sc_Iterator() {
    const thiz = this.self$4;
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, (thiz.length | 0))
  };
  length__I() {
    const thiz = this.self$4;
    return (thiz.length | 0)
  };
  seq__sc_Seq() {
    return this
  };
  sizeHintIfCheap__I() {
    const thiz = this.self$4;
    return (thiz.length | 0)
  };
  thisCollection__sc_Seq() {
    return this
  };
  isDefinedAt__O__Z(x) {
    const idx = (x | 0);
    return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
  };
  hashCode__I() {
    return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
  };
  copyToArray__O__I__I__V(xs, start, len) {
    $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
  };
  init___T(self) {
    this.self$4 = self;
    return this
  };
  newBuilder__scm_Builder() {
    return $m_sci_WrappedString$().newBuilder__scm_Builder()
  };
}
const $d_sci_WrappedString = new $TypeData().initClass({
  sci_WrappedString: 0
}, false, "scala.collection.immutable.WrappedString", {
  sci_WrappedString: 1,
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
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1
});
$c_sci_WrappedString.prototype.$classData = $d_sci_WrappedString;
class $c_sci_$colon$colon extends $c_sci_List {
  constructor() {
    super();
    this.head$5 = null;
    this.tl$5 = null
  };
  head__O() {
    return this.head$5
  };
  productPrefix__T() {
    return "::"
  };
  productArity__I() {
    return 2
  };
  tail__sci_List() {
    return this.tl$5
  };
  isEmpty__Z() {
    return false
  };
  productElement__I__O(x$1) {
    switch (x$1) {
      case 0: {
        return this.head$5;
        break
      }
      case 1: {
        return this.tl$5;
        break
      }
      default: {
        throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
      }
    }
  };
  tail__O() {
    return this.tl$5
  };
  init___O__sci_List(head, tl) {
    this.head$5 = head;
    this.tl$5 = tl;
    return this
  };
  productIterator__sc_Iterator() {
    return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
  };
}
const $is_sci_$colon$colon = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_$colon$colon)))
});
const $isArrayOf_sci_$colon$colon = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_$colon$colon)))
});
const $d_sci_$colon$colon = new $TypeData().initClass({
  sci_$colon$colon: 0
}, false, "scala.collection.immutable.$colon$colon", {
  sci_$colon$colon: 1,
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
$c_sci_$colon$colon.prototype.$classData = $d_sci_$colon$colon;
class $c_sci_Nil$ extends $c_sci_List {
  productPrefix__T() {
    return "Nil"
  };
  head__O() {
    this.head__sr_Nothing$()
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
  equals__O__Z(that) {
    if ($is_sc_GenSeq(that)) {
      const x2 = that;
      return x2.isEmpty__Z()
    } else {
      return false
    }
  };
  productElement__I__O(x$1) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
  };
  head__sr_Nothing$() {
    throw new $c_ju_NoSuchElementException().init___T("head of empty list")
  };
  tail__O() {
    return this.tail__sci_List()
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
  $$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs) {
    return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
  };
}
class $c_scm_ListBuffer extends $c_scm_AbstractBuffer {
  constructor() {
    super();
    this.scala$collection$mutable$ListBuffer$$start$6 = null;
    this.last0$6 = null;
    this.exported$6 = false;
    this.len$6 = 0
  };
  copy__p6__V() {
    if (this.isEmpty__Z()) {
      return (void 0)
    };
    let cursor = this.scala$collection$mutable$ListBuffer$$start$6;
    const this$1 = this.last0$6;
    const limit = this$1.tl$5;
    this.clear__V();
    while ((cursor !== limit)) {
      this.$$plus$eq__O__scm_ListBuffer(cursor.head__O());
      const this$2 = cursor;
      cursor = this$2.tail__sci_List()
    }
  };
  init___() {
    this.scala$collection$mutable$ListBuffer$$start$6 = $m_sci_Nil$();
    this.exported$6 = false;
    this.len$6 = 0;
    return this
  };
  apply__I__O(n) {
    if (((n < 0) || (n >= this.len$6))) {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
    } else {
      const this$2 = this.scala$collection$mutable$ListBuffer$$start$6;
      return $f_sc_LinearSeqOptimized__apply__I__O(this$2, n)
    }
  };
  lengthCompare__I__I(len) {
    const this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
    return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this$1, len)
  };
  sameElements__sc_GenIterable__Z(that) {
    const this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
    return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this$1, that)
  };
  apply__O__O(v1) {
    return this.apply__I__O((v1 | 0))
  };
  isEmpty__Z() {
    return (this.len$6 === 0)
  };
  toList__sci_List() {
    this.exported$6 = (!this.isEmpty__Z());
    return this.scala$collection$mutable$ListBuffer$$start$6
  };
  thisCollection__sc_Traversable() {
    return this
  };
  equals__O__Z(that) {
    if ($is_scm_ListBuffer(that)) {
      const x2 = that;
      return this.scala$collection$mutable$ListBuffer$$start$6.equals__O__Z(x2.scala$collection$mutable$ListBuffer$$start$6)
    } else {
      return $f_sc_GenSeqLike__equals__O__Z(this, that)
    }
  };
  mkString__T__T__T__T(start, sep, end) {
    const this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
    return $f_sc_TraversableOnce__mkString__T__T__T__T(this$1, start, sep, end)
  };
  mkString__T__T(sep) {
    const this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
    return $f_sc_TraversableOnce__mkString__T__T__T__T(this$1, "", sep, "")
  };
  $$plus$eq__O__scg_Growable(elem) {
    return this.$$plus$eq__O__scm_ListBuffer(elem)
  };
  companion__scg_GenericCompanion() {
    return $m_scm_ListBuffer$()
  };
  foreach__F1__V(f) {
    const this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
    let these = this$1;
    while ((!these.isEmpty__Z())) {
      f.apply__O__O(these.head__O());
      const this$2 = these;
      these = this$2.tail__sci_List()
    }
  };
  size__I() {
    return this.len$6
  };
  result__O() {
    return this.toList__sci_List()
  };
  iterator__sc_Iterator() {
    return new $c_scm_ListBuffer$$anon$1().init___scm_ListBuffer(this)
  };
  sizeHintBounded__I__sc_TraversableLike__V(size, boundingColl) {
    $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
  };
  length__I() {
    return this.len$6
  };
  seq__sc_Seq() {
    return this
  };
  toStream__sci_Stream() {
    return this.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream()
  };
  prependToList__sci_List__sci_List(xs) {
    if (this.isEmpty__Z()) {
      return xs
    } else {
      if (this.exported$6) {
        this.copy__p6__V()
      };
      this.last0$6.tl$5 = xs;
      return this.toList__sci_List()
    }
  };
  addString__scm_StringBuilder__T__T__T__scm_StringBuilder(b, start, sep, end) {
    const this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
    return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this$1, b, start, sep, end)
  };
  $$plus$eq__O__scm_ListBuffer(x) {
    if (this.exported$6) {
      this.copy__p6__V()
    };
    if (this.isEmpty__Z()) {
      this.last0$6 = new $c_sci_$colon$colon().init___O__sci_List(x, $m_sci_Nil$());
      this.scala$collection$mutable$ListBuffer$$start$6 = this.last0$6
    } else {
      const last1 = this.last0$6;
      this.last0$6 = new $c_sci_$colon$colon().init___O__sci_List(x, $m_sci_Nil$());
      last1.tl$5 = this.last0$6
    };
    this.len$6 = ((1 + this.len$6) | 0);
    return this
  };
  isDefinedAt__O__Z(x) {
    const x$1 = (x | 0);
    const this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
    return $f_sc_LinearSeqOptimized__isDefinedAt__I__Z(this$1, x$1)
  };
  $$plus$eq__O__scm_Builder(elem) {
    return this.$$plus$eq__O__scm_ListBuffer(elem)
  };
  sizeHint__I__V(size) {
    /*<skip>*/
  };
  clear__V() {
    this.scala$collection$mutable$ListBuffer$$start$6 = $m_sci_Nil$();
    this.last0$6 = null;
    this.exported$6 = false;
    this.len$6 = 0
  };
  $$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(xs) {
    _$plus$plus$eq: while (true) {
      const x1 = xs;
      if ((x1 !== null)) {
        if ((x1 === this)) {
          const n = this.len$6;
          xs = $f_sc_IterableLike__take__I__O(this, n);
          continue _$plus$plus$eq
        }
      };
      return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
    }
  };
  $$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs) {
    return this.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(xs)
  };
  stringPrefix__T() {
    return "ListBuffer"
  };
}
const $is_scm_ListBuffer = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ListBuffer)))
});
const $isArrayOf_scm_ListBuffer = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ListBuffer)))
});
const $d_scm_ListBuffer = new $TypeData().initClass({
  scm_ListBuffer: 0
}, false, "scala.collection.mutable.ListBuffer", {
  scm_ListBuffer: 1,
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
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_SeqForwarder: 1,
  scg_IterableForwarder: 1,
  scg_TraversableForwarder: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer.prototype.$classData = $d_scm_ListBuffer;
class $c_scm_StringBuilder extends $c_scm_AbstractSeq {
  constructor() {
    super();
    this.underlying$5 = null
  };
  seq__sc_TraversableOnce() {
    return this
  };
  $$plus$eq__C__scm_StringBuilder(x) {
    this.append__C__scm_StringBuilder(x);
    return this
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
  sameElements__sc_GenIterable__Z(that) {
    return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
  };
  apply__O__O(v1) {
    const index = (v1 | 0);
    const c = this.underlying$5.charAt__I__C(index);
    return new $c_jl_Character().init___C(c)
  };
  isEmpty__Z() {
    return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
  };
  thisCollection__sc_Traversable() {
    return this
  };
  subSequence__I__I__jl_CharSequence(start, end) {
    return this.underlying$5.substring__I__I__T(start, end)
  };
  $$plus$eq__O__scg_Growable(elem) {
    let jsx$1;
    if ((elem === null)) {
      jsx$1 = 0
    } else {
      const this$2 = elem;
      jsx$1 = this$2.value$1
    };
    return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
  };
  companion__scg_GenericCompanion() {
    return $m_scm_IndexedSeq$()
  };
  toString__T() {
    return this.underlying$5.java$lang$StringBuilder$$content$f
  };
  foreach__F1__V(f) {
    $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
  };
  result__O() {
    return this.underlying$5.java$lang$StringBuilder$$content$f
  };
  append__T__scm_StringBuilder(s) {
    const this$1 = this.underlying$5;
    this$1.java$lang$StringBuilder$$content$f = (("" + this$1.java$lang$StringBuilder$$content$f) + s);
    return this
  };
  iterator__sc_Iterator() {
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.underlying$5.length__I())
  };
  seq__scm_Seq() {
    return this
  };
  sizeHintBounded__I__sc_TraversableLike__V(size, boundingColl) {
    $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
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
  seq__sc_Seq() {
    return this
  };
  sizeHintIfCheap__I() {
    return this.underlying$5.length__I()
  };
  thisCollection__sc_Seq() {
    return this
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
  isDefinedAt__O__Z(x) {
    const idx = (x | 0);
    return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
  };
  $$plus$eq__O__scm_Builder(elem) {
    let jsx$1;
    if ((elem === null)) {
      jsx$1 = 0
    } else {
      const this$2 = elem;
      jsx$1 = this$2.value$1
    };
    return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
  };
  sizeHint__I__V(size) {
    /*<skip>*/
  };
  copyToArray__O__I__I__V(xs, start, len) {
    $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
  };
  hashCode__I() {
    return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
  };
  append__C__scm_StringBuilder(x) {
    this.underlying$5.append__C__jl_StringBuilder(x);
    return this
  };
  newBuilder__scm_Builder() {
    return new $c_scm_GrowingBuilder().init___scg_Growable(new $c_scm_StringBuilder().init___())
  };
  $$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs) {
    return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
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
  seq__sc_TraversableOnce() {
    return this
  };
  init___() {
    $c_sjs_js_WrappedArray.prototype.init___sjs_js_Array.call(this, []);
    return this
  };
  apply__I__O(index) {
    return this.array$6[index]
  };
  lengthCompare__I__I(len) {
    return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
  };
  apply__O__O(v1) {
    const index = (v1 | 0);
    return this.array$6[index]
  };
  sameElements__sc_GenIterable__Z(that) {
    return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
  };
  isEmpty__Z() {
    return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
  };
  thisCollection__sc_Traversable() {
    return this
  };
  $$plus$eq__O__scg_Growable(elem) {
    this.array$6.push(elem);
    return this
  };
  companion__scg_GenericCompanion() {
    return $m_sjs_js_WrappedArray$()
  };
  foreach__F1__V(f) {
    $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
  };
  result__O() {
    return this
  };
  seq__scm_Seq() {
    return this
  };
  iterator__sc_Iterator() {
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, (this.array$6.length | 0))
  };
  sizeHintBounded__I__sc_TraversableLike__V(size, boundingColl) {
    $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
  };
  seq__sc_Seq() {
    return this
  };
  length__I() {
    return (this.array$6.length | 0)
  };
  sizeHintIfCheap__I() {
    return (this.array$6.length | 0)
  };
  thisCollection__sc_Seq() {
    return this
  };
  isDefinedAt__O__Z(x) {
    const idx = (x | 0);
    return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
  };
  $$plus$eq__O__scm_Builder(elem) {
    this.array$6.push(elem);
    return this
  };
  copyToArray__O__I__I__V(xs, start, len) {
    $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
  };
  sizeHint__I__V(size) {
    /*<skip>*/
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
const $is_sjs_js_WrappedArray = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_WrappedArray)))
});
const $isArrayOf_sjs_js_WrappedArray = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_WrappedArray)))
});
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
class $c_scm_ArrayBuffer extends $c_scm_AbstractBuffer {
  constructor() {
    super();
    this.initialSize$6 = 0;
    this.array$6 = null;
    this.size0$6 = 0
  };
  seq__sc_TraversableOnce() {
    return this
  };
  $$plus$eq__O__scm_ArrayBuffer(elem) {
    const n = ((1 + this.size0$6) | 0);
    $f_scm_ResizableArray__ensureSize__I__V(this, n);
    this.array$6.u[this.size0$6] = elem;
    this.size0$6 = ((1 + this.size0$6) | 0);
    return this
  };
  init___() {
    $c_scm_ArrayBuffer.prototype.init___I.call(this, 16);
    return this
  };
  apply__I__O(idx) {
    return $f_scm_ResizableArray__apply__I__O(this, idx)
  };
  lengthCompare__I__I(len) {
    return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
  };
  sameElements__sc_GenIterable__Z(that) {
    return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
  };
  apply__O__O(v1) {
    const idx = (v1 | 0);
    return $f_scm_ResizableArray__apply__I__O(this, idx)
  };
  isEmpty__Z() {
    return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
  };
  thisCollection__sc_Traversable() {
    return this
  };
  $$plus$eq__O__scg_Growable(elem) {
    return this.$$plus$eq__O__scm_ArrayBuffer(elem)
  };
  companion__scg_GenericCompanion() {
    return $m_scm_ArrayBuffer$()
  };
  foreach__F1__V(f) {
    $f_scm_ResizableArray__foreach__F1__V(this, f)
  };
  result__O() {
    return this
  };
  iterator__sc_Iterator() {
    return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.size0$6)
  };
  seq__scm_Seq() {
    return this
  };
  sizeHintBounded__I__sc_TraversableLike__V(size, boundingColl) {
    $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
  };
  init___I(initialSize) {
    this.initialSize$6 = initialSize;
    $f_scm_ResizableArray__$$init$__V(this);
    return this
  };
  length__I() {
    return this.size0$6
  };
  seq__sc_Seq() {
    return this
  };
  sizeHintIfCheap__I() {
    return this.size0$6
  };
  thisCollection__sc_Seq() {
    return this
  };
  $$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer(xs) {
    if ($is_sc_IndexedSeqLike(xs)) {
      const x2 = xs;
      const n = x2.length__I();
      const n$1 = ((this.size0$6 + n) | 0);
      $f_scm_ResizableArray__ensureSize__I__V(this, n$1);
      x2.copyToArray__O__I__I__V(this.array$6, this.size0$6, n);
      this.size0$6 = ((this.size0$6 + n) | 0);
      return this
    } else {
      return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
    }
  };
  isDefinedAt__O__Z(x) {
    const idx = (x | 0);
    return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
  };
  $$plus$eq__O__scm_Builder(elem) {
    return this.$$plus$eq__O__scm_ArrayBuffer(elem)
  };
  sizeHint__I__V(len) {
    if (((len > this.size0$6) && (len >= 1))) {
      const newarray = $newArrayObject($d_O.getArrayOf(), [len]);
      $systemArraycopy(this.array$6, 0, newarray, 0, this.size0$6);
      this.array$6 = newarray
    }
  };
  copyToArray__O__I__I__V(xs, start, len) {
    $f_scm_ResizableArray__copyToArray__O__I__I__V(this, xs, start, len)
  };
  hashCode__I() {
    return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
  };
  $$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs) {
    return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer(xs)
  };
  stringPrefix__T() {
    return "ArrayBuffer"
  };
}
const $is_scm_ArrayBuffer = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuffer)))
});
const $isArrayOf_scm_ArrayBuffer = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuffer)))
});
const $d_scm_ArrayBuffer = new $TypeData().initClass({
  scm_ArrayBuffer: 0
}, false, "scala.collection.mutable.ArrayBuffer", {
  scm_ArrayBuffer: 1,
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
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1,
  scm_ResizableArray: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer.prototype.$classData = $d_scm_ArrayBuffer;
$e.provideFindReferences = (function() {
  return $m_Llaughedelic_atom_ide_scala_Exports$().provideFindReferences__sjs_js_Any()
});
$e.deactivate = (function() {
  return $m_Llaughedelic_atom_ide_scala_Exports$().deactivate__sjs_js_Promise()
});
$e.provideCodeHighlight = (function() {
  return $m_Llaughedelic_atom_ide_scala_Exports$().provideCodeHighlight__sjs_js_Any()
});
$e.provideCodeFormat = (function() {
  return $m_Llaughedelic_atom_ide_scala_Exports$().provideCodeFormat__sjs_js_Any()
});
$e.consumeSignatureHelp = (function(arg$1) {
  const prep0 = arg$1;
  return $m_Llaughedelic_atom_ide_scala_Exports$().consumeSignatureHelp__sjs_js_Any__sjs_js_Any(prep0)
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
  $m_Llaughedelic_atom_ide_scala_Exports$().consumeBusySignal__Llaughedelic_atom_ide_ui_busysignal_BusySignalService__V(prep0)
});
$e.provideAutocomplete = (function() {
  return $m_Llaughedelic_atom_ide_scala_Exports$().provideAutocomplete__sjs_js_Any()
});
//# sourceMappingURL=main.js.map

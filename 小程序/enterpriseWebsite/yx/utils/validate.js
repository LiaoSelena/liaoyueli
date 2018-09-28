//验证手机号码
function phone(phone) {
  let flag = true
  var regx = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(18[0-9]{1})|(19[0-9]{1}))+\d{8})$/
  if (phone != '' && regx.test(phone)) {
    flag = true
  } else {
    flag = false
  }
  return flag
}

//验证字符串长度
function strLength(val, min, max) {
  let flag = true
  let length = val.length
  if (length != '' && length >= min && length <= max) {
    flag = true;
  } else {
    flag = false;
  }
  return flag
}

//验证汉字
function china(val){
  let flag = true
  let china = /^[\u4e00-\u9fa5]+$/;
  if (!china.test(val)) flag = false
  return flag
}

module.exports = {
  phone: phone,
  strLength: strLength,
  china: china
}
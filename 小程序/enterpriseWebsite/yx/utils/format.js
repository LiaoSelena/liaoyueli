//解码中文为2个字符
function length(_val){
  let val = _val
  let count = 0
  for (var i = 0; i < val.length; i++) {
    var c = val.charAt(i);
    if (/^[\u0000-\u00ff]$/.test(c)) //匹配双字节
    {
      count += 1;
    }
    else {
      count += 2;
    }
  }
  return count
}

module.exports = {
  length: length
}
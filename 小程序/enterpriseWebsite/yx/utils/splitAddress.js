function split(_address, name) {
  let regex = /^(北京市|天津市|重庆市|上海市|香港特别行政区|澳门特别行政区)/
  let pro = []
  let addressBean = {
    pro: null,
    city: null,
    address: null
  }
  function regexAddressBean(_address, addressBean) {
    regex = /^(.*?[市州]|.*?地区|.*?特别行政区)(.*?)$/g
    let addxress = regex.exec(_address)
    addressBean.city = addxress[1]
    addressBean.address = addxress[2] + '(' + name + ')'
  }
  if (!(pro = regex.exec(_address))) {
    regex = /^(.*?(省|自治区))(.*?)$/
    pro = regex.exec(_address)
    addressBean.pro = pro[1]
    regexAddressBean(pro[3], addressBean)
  } else {
    addressBean.pro = pro[1]
    regexAddressBean(_address, addressBean)
  }
  return addressBean
}
module.exports.split = split
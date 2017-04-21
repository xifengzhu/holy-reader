function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatImageUrl(url) {
  const ApiURI = 'https://api.zhuishushenqi.com';
  if (url.indexOf("agent") != -1) {
    return url.split("/agent/")[1];
  } else if (url.indexOf("http") == -1) {
    return ApiURI + url;
  } else {
    return url;
  }
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

module.exports = {
  formatTime: formatTime,
  formatImageUrl: formatImageUrl,
  getRandomColor: getRandomColor
}

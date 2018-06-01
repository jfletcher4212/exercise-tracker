
function isValidDate(date){
  var testRegex = RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
  return testRegex.test(date);
}

module.exports = isValidDate;
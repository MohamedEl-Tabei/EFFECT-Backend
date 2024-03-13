const getErrorMessage = (error) => {
  if (error.errors) {
    return Object.values(error.errors)[0].message;
  }
  if (error.code) {
    if (Object.keys(error.keyValue)[0] === "email")
      return "This email is already registered.";
    else if (Object.keys(error.keyValue)[0] === "key")
      return "This name is already exist.";
    else if (Object.keys(error.keyValue)[0] === "colorKey")
      return "This color is already used.";
    else return "iam used before";
  }
  return error.message;
};

module.exports = getErrorMessage;

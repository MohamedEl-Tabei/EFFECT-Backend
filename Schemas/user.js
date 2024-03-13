const user = {
  name: {
    type: String,
    required: "Name is required",
    trim: true,
    validate: {
      validator: (name) => {
        if (name.length < 3)
          throw new Error(
            "Your username is too short. The minimum length is 3 characters."
          );
        if (name.length > 20)
          throw new Error(
            "Your name is too long. The maximum length is 20 characters."
          );
        if (!/^[A-Za-z].*$/.test(name))
          throw new Error("Name must begin with the letters A-Z.");
      },
    },
  },
  birthday: {
    type: String,
    required: "Birthday is required",
    match: [/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, "Please enter your date of birth"],
  },
  profilePicture: {
    type: String,
    default:
      "https://img.freepik.com/free-photo/birds-nest-plant-beige-pot_53876-134284.jpg?w=740&t=st=1696426563~exp=1696427163~hmac=1314ec8d1b1a6ee25738680ed2eb0df3342ee4649f092242d7d94d742f4ceb56",
  },
  email: {
    type: String,
    unique: true,
    required: "Email is required",
    match: [
      /^[A-Za-z]+[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      "Invalid email address",
    ],
  },
  password: {
    type: String,
    required: "Password is required",
    maxLength: [
      26,
      "Your password is too long. The maximum length is 26 characters.",
    ],
    minLength: [
      8,
      "Your password is too short. The minimum length is 8 characters.",
    ],
    validate: {
      validator: (password) => {
        if (!/[0-9]/.test(password))
          throw new Error("Password must contain numbers 0-9.");
        if (!/[A-Z]/.test(password))
          throw new Error("Password must contain uppercase letters A-Z.");
        if (!/[a-z]/.test(password))
          throw new Error("Password must contain lowercase letters a-z.");
        if (!/[!@#$%^&*]/.test(password))
          throw new Error(
            "Password must contain special characters [!@#$%^&*]."
          );
      },
    },
  },
};
module.exports = user;

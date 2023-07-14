const { ADMINS, USER } = require('../models/index');
const { encryptText, pagination, generatePdf, generatePdf2 } = require('../utils/helpers');


exports.signIn = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const admin = await ADMINS.findOne({ email, password });
    if (admin) {
      res.status(200).json({ success: true, message: 'Signin successful!', admin });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to signin', error });
  }
};

exports.signUp = async (req, res, next) => {
  const { email, password, secret } = req.body;
  if(secret && secret === '548950'){
  const existingAdmin = await ADMINS.findOne({ email });
  console.log({ existingAdmin });
  if (existingAdmin) {
    return res.status(409).json({ success: false, message: 'Admin with the same email all ready exist' });
  }
  const newAdmin = new ADMINS({ email, password, admin_type: 'SUPER_ADMIN' });
  const token = encryptText(JSON.stringify({ email: newAdmin.email, dateTime: new Date() }));
  newAdmin.token = token;
  newAdmin
    .save()
    .then(() => {
      res.status(200).json({ success: true, message: 'Signup successful!' });
    })
    .catch(error => {
      res.status(500).json({ message: 'Failed to signup', error });
    });
  }
  else {
    return res.status(400).json({ success: false, message: 'Unauthorised User' });
  }
};
exports.deleteAdmin = async (req, res, next) => {
  const { email, secret } = req.body;
  if(secret && secret === '548950'){
  const existingAdmin = await ADMINS.deleteOne({ email })
    .then(() => {
      res.status(200).json({ success: true, message: 'Admin deleted successful!' });
    })
    .catch(error => {
      res.status(500).json({ message: 'Failed to delete', error });
    });
  }
  else {
    return res.status(400).json({ success: false, message: 'Unauthorised User' });
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    let { page, itemsPerPage, searchText } = req.query;
    console.log({ page, itemsPerPage, searchText });

    let query = {
      $and: [],
      $or: [],
    };
    if (searchText && searchText !== '') {
      query.$or = [
        {
          email: { $regex: '.*' + searchText + '.*', $options: 'i' },
        },
        {
          full_name: { $regex: '.*' + searchText + '.*', $options: 'i' },
        },
      ];
    }
    if (!query.$and.length > 0) {
      delete query.$and;
    }
    if (!query.$or.length > 0) {
      delete query.$or;
    }

    let totalItems = await USER.countDocuments(query);
    let admins = await USER.find(query)
      .sort([['created_at', -1]])
      .skip((+page - 1) * +itemsPerPage)
      .limit(+itemsPerPage)
      .lean();

    let data = pagination(admins, page, totalItems, itemsPerPage);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    return next({
      code: 500,
      success: false,
      message: 'Internal Server error',
      error,
    });
  }
};
exports.downloadPdf = async (req, res, next) => {
  try {
    let { id } = req.query;
    console.log({ id });
    let user = await USER.findById(id)
    const pdfBuffer = await generatePdf(user);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return next({
      code: 500,
      success: false,
      message: error.message || 'Internal Server error',
      error,
    });
  }
};


exports.createUser = async (req, res, next) => {
  const {
    email,
    full_name,
    address,
    city,
    postal_code,
    province,
    home_phone,
    cell_phone,
    emergency_contact,
    driving_lisence,
    gender,
    dob,
    issue_date,
    expiry_date,
    license_image,
    student_number
  } = req.body;
  const existingUser = await USER.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User with the same email all ready exist',
    });
  }
  const newUser = new USER({
    email,
    full_name,
    address,
    city,
    postal_code,
    province,
    home_phone,
    cell_phone,
    emergency_contact,
    driving_lisence,
    gender,
    dob,
    issue_date,
    expiry_date,
    license_image,
    student_number
  });
  newUser
    .save()
    .then(() => {
      res.status(200).json({ success: true, message: 'User created successful!' , newUser});
    })
    .catch(error => {
      res.status(500).json({ message: 'Failed to create User', error });
    });
};


exports.editUser = async (req, res, next) => {
  let id = req.params.id;
  const {
    email,
    full_name,
    address,
    city,
    postal_code,
    province,
    home_phone,
    cell_phone,
    emergency_contact,
    driving_lisence,
    gender,
    dob,
    issue_date,
    expiry_date,
    lisence_image,
    student_number
  } = req.body;
  const existingUser = await USER.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        email,
        full_name,
        address,
        city,
        postal_code,
        home_phone,
        cell_phone,
        province,
        emergency_contact,
        driving_lisence,
        gender,
        dob,
        issue_date,
        expiry_date,
        lisence_image,
        student_number
      },
    },
  )
    .then(() => {
      res.status(200).json({ success: true, message: 'User edited successful!' });
    })
    .catch(error => {
      res.status(500).json({ message: 'Failed to edit User', error });
    });
};

exports.deleteUser = async (req, res, next) => {
  let id = req.params.id;
  console.log(id);
  try {
    await USER.findByIdAndDelete({
      _id: id,
    });
    res.status(200).json({ success: true, message: 'User deleted successful!' });
  } catch (err) {
    console.log({ err: JSON.Stringify(err) });
    res.status(400).json({ success: false, message: 'Fail to remove user', err });
  }
};

exports.getPermissions = async (req, res) => {
  const { id } = req.query;

  if (id) {
    const admin = await ADMINS.findById(id);
    if (admin) {
      res.status(200).json({
        success: true,
        permissions: ['users'],
      });
    } else {
      res.status(401).json({ message: 'Unable To Get Permissions' });
    }
  }
};

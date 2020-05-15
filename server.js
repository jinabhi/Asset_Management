const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
// const upload = require('express-fileupload');
const exphbs = require('express-handlebars');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Started on Port ${PORT}`));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(function (req, res, next) {
  res.set(
    'Cache-Control',
    'no-cache,private,no-store,must-revalidate,max-state=0,post-check=0,pre-check=0'
  );
  next();
});

app.use(session({ secret: 'asasasasas' }));

app.engine(
  'hbs',
  exphbs({
    extname: 'hbs',
    defaultlayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
  })
);

app.use(bodyparser.json());
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);

const URL = 'mongodb://localhost:27017/assetManagement';
mongoose.connect(URL, { useNewUrlParser: true });

/***************************** GET REQUESTS ******************************/

app.get('/', (req, res) => {
  res.render('loginPage');
});

app.get('/adminHome', (req, res) => {
  res.render('adminHome', { adid: req.session.user });
});

app.get('/employeeHome', (req, res) => {
  var id = req.session.emp;
  users.find({ empid: id }, (err, result) => {
    if (err) throw err;
    else if (result.length != 0) {
      res.render('employeeHome', {
        emplid: req.session.emp,
        data: result,
      });
    }
  });
});

app.get('/managerHome', (req, res) => {
  var id = req.session.mgr;
  users.find({ empid: id }, (err, result) => {
    if (err) throw err;
    else if (result.length != 0) {
      res.render('managerHome', {
        manid: req.session.mgr,
        data: result,
      });
    }
  });
});

app.get('/supportHome', (req, res) => {
  var id = req.session.sup;
  users.find({ empid: id }, (err, result) => {
    if (err) throw err;
    else if (result.length != 0) {
      res.render('supportHome', {
        supid: req.session.sup,
        data: result,
      });
    }
  });
});

/***************************** MODELS IMPORT ******************************/

var Admin = require('./models/adminlogin');
var users = require('./models/users');
var asset = require('./models/assets');
var requests = require('./models/request');
var transfers = require('./models/transfer');
/*
app.get('/insert', (req, res) => {
  var Login = Admin({
    uid: 'admin',
    pwd: 'admin123',
  });
  Login.save();
  res.render('/');
}); */

/******************************* LOGOUT GET REQUEST ******************************/

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('loginPage');
});

/************************* LOGIN CHECK ******************************/

app.post('/loginCheck', (req, res) => {
  var userid = req.body.uid;
  var pswd = req.body.pwd;
  var estatus;
  if (userid == 'admin') {
    Admin.find({ uid: userid, pwd: pswd }, (err, result) => {
      if (err) throw err;
      else if (result.length != 0) {
        req.session.admin = userid;
        res.render('adminHome', { adid: req.session.admin });
      } else res.render('loginPage', { msg: 'Login Fail' });
    });
  } else if (userid.charAt(0) == 'E') {
    users.find({ empid: userid, pwd: pswd }, (err, result) => {
      if (err) throw err;
      else if (result.length != 0) {
        estatus = result[0].status;
        if (estatus == 'Active') {
          //          name = result[0].fname;
          req.session.emp = userid;
          // console.log(result);
          res.render('employeeHome', {
            emplid: req.session.emp,
            data: result,
          });
        } else res.render('loginPage', { msg: 'User Not Active' });
      } else res.render('loginPage', { msg: 'Login Fail' });
    });
  } else if (userid.charAt(0) == 'M') {
    users.find({ empid: userid, pwd: pswd }, (err, result) => {
      if (err) throw err;
      else if (result.length != 0) {
        estatus = result[0].status;
        if (estatus == 'Active') {
          //          name = result[0].fname;
          req.session.mgr = userid;
          res.render('managerHome', { manid: req.session.mgr, data: result });
        } else res.render('loginPage', { msg: 'User Not Active' });
      } else res.render('loginPage', { msg: 'Login Fail' });
    });
  } else if (userid.charAt(0) == 'S') {
    users.find({ empid: userid, pwd: pswd }, (err, result) => {
      if (err) throw err;
      else if (result.length != 0) {
        estatus = result[0].status;
        if (estatus == 'Active') {
          //          name = result[0].fname;
          req.session.sup = userid;
          res.render('supportHome', { supid: req.session.sup, data: result });
        } else res.render('loginPage', { msg: 'User Not Active' });
      } else res.render('loginPage', { msg: 'Login Fail' });
    });
  }
});

/************************* CREATE USER BY ADMIN ******************************/

app.post('/addUser', (req, res) => {
  var firstName = req.body.fname;
  var lastName = req.body.lname;
  var emailAddress = req.body.email;
  var password = req.body.pwd;
  var mgr_id = req.body.mgrid;
  var designation = req.body.employeeCategory;
  var mobile = req.body.mobNum;
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  var dateOfJoining = dd + '/' + mm + '/' + yyyy;
  // var today = new Date();
  // var dateOfJoining =
  //   today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  var userStatus = 'Active';
  var emp_id;
  if (designation == 'Support') emp_id = 'S' + req.body.empid;
  else if (designation == 'Manager') emp_id = 'M' + req.body.empid;
  else if (designation == 'Employee') emp_id = 'E' + req.body.empid;
  console.log('Name ' + firstName + lastName);
  var user = users({
    fname: firstName,
    lname: lastName,
    email: emailAddress,
    pwd: password,
    empid: emp_id,
    mgrid: mgr_id,
    employeeCategory: designation,
    mobNum: mobile,
    doj: dateOfJoining,
    status: userStatus,
  });
  user.save().then((data) => {
    res.render('adminHome', {
      msg: 'Record Added ...!!',
      adid: req.session.admin,
    });
  });
});

/************************* CHANGE ADMIN PASSWORD ****************************/

app.post('/changePass', (req, res) => {
  var oldPassword = req.body.oldPwd;
  var newPassword = req.body.newPwd;
  var userId = req.session.admin;
  Admin.find({ uid: userId, pwd: oldPassword }, (err, result) => {
    if (err) throw err;
    else if (result.length != 0) {
      Admin.update(
        { uid: userId },
        {
          $set: {
            pwd: newPassword,
          },
        },
        (err, result) => {
          if (err) throw err;
          else {
            console.log('Password Changed');
          }
        }
      );
      res.render('adminHome', {
        msg: 'Password Changed',
        adid: req.session.user,
      });
    } else
      res.render('adminHome', {
        msg: 'Current Password is Wrong',
        adid: req.session.admin,
      });
  });
});

/************************* ADD ASSET **************************************/

app.post('/addAsset', (req, res) => {
  var aid = req.body.assetid;
  var atype = req.body.assetType;
  var aqty = parseInt(req.body.quantity);
  var astatus = 'Available';
  var isto = '';
  var isdate = '';
  var ast;
  for (var i = 1; i <= aqty; i++) {
    aid = 'A' + aid + i;
    ast = asset({
      assetid: aid,
      assetName: atype,
      assetStatus: astatus,
      issuedTo: isto,
      issueDate: isdate,
    });
    ast.save().then((err, data) => {
      //      console.log(data);
      if (err) throw err;
      else if (data.length != 0) {
        console.log('asset ' + i + ' added');
      }
    });
    aid = req.body.assetid;
  }
  res.render('adminHome', {
    msg: 'Assets Created ...!!',
    adid: req.session.admin,
  });
});

/************************* View All USER **********************************/

app.get('/viewUser', (req, res) => {
  users.find((err, result) => {
    //    console.log(result);
    if (err) throw err;
    else res.render('viewAllUser', { data: result, adid: req.session.admin });
  });
});

/************************* CHANGE USER STATUS **********************************/

app.get('/changeEStatus', (req, res) => {
  var id = req.query.eid;
  users.find({ empid: id }, (err, result) => {
    if (err) throw err;
    else if (result.length != 0) {
      var estatus = result[0].status;
      if (estatus == 'Active') {
        users.update(
          { empid: id },
          {
            $set: {
              status: 'InActive',
            },
          },
          (err, result) => {
            if (err) throw err;
            else {
              users.find((err, result) => {
                if (err) throw err;
                else
                  res.render('viewAllUser', {
                    data: result,
                    msg: 'User Deactivated',
                    adid: req.session.admin,
                  });
              });
            }
          }
        );
      }
      if (estatus == 'InActive') {
        users.update(
          { empid: id },
          {
            $set: {
              status: 'Active',
            },
          },
          (err, result) => {
            if (err) throw err;
            else {
              users.find((err, result) => {
                if (err) throw err;
                else
                  res.render('viewAllUser', {
                    data: result,
                    msg: 'User Activated',
                    adid: req.session.admin,
                  });
              });
            }
          }
        );
      }
    }
  });
});

/************************* UPDATE/MODIFY USER *******************************/

app.get('/modifyUser', (req, res) => {
  var id = req.query.eid;
  //  console.log(pid);
  users.findOne({ empid: id }, (err, result) => {
    if (err) throw err;
    else {
      //      console.log(result);
      res.render('updateUser', { data: result, adid: req.session.admin });
    }
  });
});

var ObjectID = require('mongodb').ObjectID;

app.post('/modfyUser', (req, res) => {
  var oid = req.body.eoid;
  var nfirstName = req.body.fname;
  var nlastName = req.body.lname;
  var nemail = req.body.email;
  var newid = req.body.empid;
  var nmgrid = req.body.mgrid;
  var ndesignation = req.body.empCat;
  var nmobile = req.body.mobNum;
  users.update(
    { _id: new ObjectID(oid) },
    {
      $set: {
        fname: nfirstName,
        lname: nlastName,
        email: nemail,
        empid: newid,
        mgrid: nmgrid,
        employeeCategory: ndesignation,
        mobNum: nmobile,
      },
    },
    (err, result) => {
      if (err) throw err;
      else {
        console.log('Password Changed');
        users.find((err, result) => {
          if (err) throw err;
          res.render('viewAllUser', {
            data: result,
            msg: 'User Updated',
            adid: req.session.admin,
          });
        });
      }
    }
  );
});

/************************* CREATE REQUEST Employee ******************************/

app.post('/reqempAsset', (req, res) => {
  var emp_id = req.session.emp;
  var asset_name = req.body.assetreqType;
  users.find({ empid: emp_id }, (err, result) => {
    if (err) throw err;
    else if (result.length != 0) var mgr_id = result[0].mgrid;
    var req_id = 'R' + Math.floor(Math.random() * 10000);
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    var req_date = dd + '/' + mm + '/' + yyyy;
    var req_status = 'Pending with Manager';

    var req = requests({
      reqid: req_id,
      reid: emp_id,
      rmid: mgr_id,
      assetName: asset_name,
      reqDate: req_date,
      reqStatus: req_status,
    });
    req.save().then((data) => {
      res.render('employeeHome', {
        msg: 'Request Created ...!!',
        //emplid: req.session.emp,
        data: result,
      });
      console.log('Request Created');
    });
  });
});

/************************* CREATE REQUEST Manager ******************************/

app.post('/reqmgrAsset', (req, res) => {
  var emp_id = req.session.mgr;
  var asset_name = req.body.assetreqType;
  users.find({ empid: emp_id }, (err, result) => {
    if (err) throw err;
    else if (result.length != 0) var mgr_id = result[0].mgrid;
    var req_id = 'R' + Math.floor(Math.random() * 10000);
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    var req_date = dd + '/' + mm + '/' + yyyy;
    var req_status = 'Pending with Support';

    var req = requests({
      reqid: req_id,
      reid: emp_id,
      rmid: mgr_id,
      assetName: asset_name,
      reqDate: req_date,
      reqStatus: req_status,
    });
    req.save().then((data) => {
      res.render('managerHome', {
        msg: 'Request Created ...!!',
        //emplid: req.session.emp,
        data: result,
      });
      console.log('Request Created');
    });
  });
});

/************************* VIEW EMPLOYEE'S REQUESTS ******************************/
app.get('/viewempReq', (req, res) => {
  emid = req.session.emp;
  requests.find({ reid: emid }, (err, result) => {
    //    console.log(result);
    if (err) throw err;
    else {
      res.render('viewRequestbyEmp', {
        data: result,
        emplid: req.session.emp,
      });
    }
  });
});

/************************* VIEW MANAGER'S REQUESTS ******************************/

app.get('/viewmgrReq', (req, res) => {
  var emid = req.session.mgr;
  requests.find({ reid: emid }, (err, result) => {
    //    console.log(result);
    if (err) throw err;
    else {
      res.render('viewRequestbyMgr', {
        data: result,
        manid: req.session.mgr,
      });
    }
  });
});

/************************* VIEW PENDING REQUESTS MANAGER ******************************/

app.get('/pendingReqMgr', (req, res) => {
  var emid = req.session.mgr;
  var stat = 'Pending with Manager';
  requests.find({ rmid: emid, reqStatus: stat }, (err, result) => {
    //    console.log(result);
    if (err) throw err;
    else {
      res.render('viewPendingMgr', {
        data: result,
        manid: req.session.mgr,
      });
    }
  });
});

/************************* MANAGER ACCEPT/REJECT REQUESTS ******************************/

app.get('/acceptReq', (req, res) => {
  var reid = req.query.requid;
  var emid = req.session.mgr;
  requests.update(
    { reqid: reid },
    {
      $set: {
        reqStatus: 'Pending with Support',
      },
    },
    (err, result) => {
      if (err) throw err;
      else {
        var stat = 'Pending with Manager';
        requests.find({ rmid: emid, reqStatus: stat }, (err, result) => {
          //    console.log(result);
          if (err) throw err;
          else {
            res.render('viewPendingMgr', {
              data: result,
              manid: req.session.mgr,
            });
          }
        });
      }
    }
  );
});

app.get('/rejectReq', (req, res) => {
  var reid = req.query.requid;
  var emid = req.session.mgr;
  requests.update(
    { reqid: reid },
    {
      $set: {
        reqStatus: 'Rejected by Manager',
      },
    },
    (err, result) => {
      if (err) throw err;
      else {
        var stat = 'Pending with Manager';
        requests.find({ rmid: emid, reqStatus: stat }, (err, result) => {
          //    console.log(result);
          if (err) throw err;
          else {
            res.render('viewPendingMgr', {
              data: result,
              manid: req.session.mgr,
            });
          }
        });
      }
    }
  );
});

/************************* VIEW PENDING REQUESTS SUPPORT ******************************/

app.get('/pendingReqSup', (req, res) => {
  var sta = 'Pending with Support';
  requests.find({ reqStatus: sta }, (err, result) => {
    //    console.log(result);
    if (err) throw err;
    else {
      res.render('viewPendingSup', {
        data: result,
        supid: req.session.sup,
      });
    }
  });
});

/************************* SUPPORT REQUEST ACCEPT ******************************/

app.get('/acceptReqSup', (req, res) => {
  var rsid = req.query.reqsid;
  requests.find({ reqid: rsid }, (err, result) => {
    if (err) throw err;
    else {
      var ass = result[0].assetName;
      var iid = result[0].reid;
      var reqID = rsid;
      var stt = 'Available';
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();
      var isDate = dd + '/' + mm + '/' + yyyy;
      asset.find({ assetName: ass, assetStatus: stt }, (err, result) => {
        if (err) throw err;
        else {
          if (result.length != 0) {
            for (var i = 1; i <= result.length; i++) {
              asset.update(
                { assetName: ass },
                {
                  $set: {
                    assetStatus: 'Issued',
                    issuedTo: iid,
                    issueDate: isDate,
                  },
                },
                (err, result) => {
                  if (err) throw err;
                  else {
                    var sta = 'Pending with Support';
                    requests.find({ reqStatus: sta }, (err, result) => {
                      //    console.log(result);
                      if (err) throw err;
                      else {
                        res.render('viewPendingSup', {
                          data: result,
                          msg: 'Request Approved',
                          supid: req.session.sup,
                        });
                      }
                    });
                  }
                }
              );
              i = result.length;
            }
            requests.update(
              { reqid: reqID },
              {
                $set: {
                  reqStatus: 'Approved by Support',
                },
              },
              (err, result) => {
                if (err) throw err;
                else {
                  console.log(result);
                  console.log('Request Updated');
                }
              }
            );
          } else {
            requests.update(
              { reqid: reqID },
              {
                $set: {
                  reqStatus: 'Rejected by Support',
                },
              },
              (err, result) => {
                if (err) throw err;
                else {
                  console.log(result);
                  console.log('Request Updated');
                }
              }
            );
            var sta = 'Pending with Support';
            requests.find({ reqStatus: sta }, (err, result) => {
              //    console.log(result);
              if (err) throw err;
              else {
                res.render('viewPendingSup', {
                  data: result,
                  msg: 'Request rejected due to inavailability of Asset',
                  supid: req.session.sup,
                });
              }
            });
          }
        }
      });
    }
  });
});

/************************* VIEW ASSET REPORT ******************************/

app.get('/viewReports', (req, res) => {
  asset.find((err, result) => {
    if (err) throw err;
    else {
      requests.find((err, resultone) => {
        if (err) throw err;
        else {
          res.render('reports', {
            dataone: resultone,
            data: result,
            supid: req.session.sup,
          });
        }
      });
    }
  });
});

/************************* VIEW EMPLOYEE ASSET ******************************/

app.get('/viewmyEmpAsset', (req, res) => {
  var emid = req.session.emp;
  asset.find({ issuedTo: emid }, (err, result) => {
    //    console.log(result);
    if (err) throw err;
    else {
      res.render('viewEmpAsset', {
        data: result,
        emplid: req.session.emp,
      });
    }
  });
});

/************************* VIEW MANAGER ASSET ******************************/

app.get('/viewmyMgrAsset', (req, res) => {
  var em_id = req.session.mgr;
  asset.find({ issuedTo: em_id }, (err, result) => {
    //    console.log(result);
    if (err) throw err;
    else {
      res.render('viewMgrAsset', {
        data: result,
        manid: req.session.mgr,
      });
    }
  });
});

/************************* VIEW MANAGER TEAM ******************************/

app.get('/viewmyTeam', (req, res) => {
  var emmid = req.session.mgr;
  users.find({ mgrid: emmid, status: 'Active' }, (err, result) => {
    //    console.log(result);
    if (err) throw err;
    else {
      requests.find({ rmid: emmid }, (err, resultone) => {
        if (err) throw err;
        else {
          // var dbo = db('assetManagement');
          // dbo.collection(users).aggregate(
          //   [
          //     {
          //       $lookup: {
          //         from: 'assets',
          //         localField: 'empid',
          //         foreignField: 'issuedTo',
          //         as: 'asset_data',
          //       },
          //     },
          //   ],
          //   (err, resulttwo) => {
          //     if (err) throw err;
          //     else {
          //console.log(resulttwo);
          res.render('myTeam', {
            data: result,
            dataone: resultone,
            manid: req.session.mgr,
          });
          //     }
          //   }
          // );
        }
      });
    }
  });
});

/************************* TRANSFER REQUEST ******************************/

app.get('/transferAssetEmp', (req, res) => {
  var a_id = req.query.id;
  console.log(a_id);

  var e_id = req.session.emp;
  asset.find({ issuedTo: a_id }, (err, result) => {
    if (err) throw err;
    else {
      console.log(result);
      users.find(
        {
          employeeCategory: { $ne: 'Support' },
          empid: { $ne: e_id },
          status: 'Active',
        },
        (err, resultone) => {
          if (err) throw err;
          else {
            //console.log(resultone);

            res.render('transferERequest', {
              data: result,
              dataone: resultone,
              emplid: req.session.emp,
            });
          }
        }
      );
    }
  });
});

app.post('/transferOne', (req, res) => {
  var tid = 'T' + Math.floor(Math.random() * 10000);
  var fromEmp = req.session.emp;
  var trass_id = req.body.trassid;
  var trass_name = req.body.trassname;
  var recep = req.body.recepient;
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  var tr_date = dd + '/' + mm + '/' + yyyy;
  var tr_status = 'Pending with Manager';
  users.find({ empid: fromEmp }, (err, result) => {
    if (err) throw err;
    else {
      var tr_mgr = result[0].mgrid;
      var tr_req = transfers({
        transferid: tid,
        fromempid: fromEmp,
        trmgrid: tr_mgr,
        transferassetid: trass_id,
        transferassetName: trass_name,
        toempid: recep,
        transferDate: tr_date,
        transferStatus: req_status,
      });
      tr_req.save().then((data) => {
        asset.find({ issuedTo: req.session.emp }, (err, resultone) => {
          //    console.log(result);
          if (err) throw err;
          else {
            res.render('viewEmpAsset', {
              msg: 'Transfer Request Created ...!!',
              data: resultone,
              emplid: req.session.emp,
            });
          }
        });

        console.log('Request Created');
      });
    }
  });
});

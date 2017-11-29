var db = require('../db_config.js');
var userController = require("./userController.js");

exports.list = function(callback){
	db.User.find({"category" : 'd'}, function(error, doctors) {
		if(error) {
			callback({error: 'Não foi possivel retornar os medicos',
								message: error});
		} else {
			callback(doctors);
		}
	});
};

exports.doctor = function(id, callback) {

	db.User.findById(id, function(error, doctor) {

		if(error) {
			callback({error: 'Não foi possivel retornar o medico',
								message: error});
		} else {

			callback(doctor);
		}
	});
};

exports.save = function(username, age, password, phone,
											crm, specialty, callback){

	var newDoctor = {
		'username': username,
		'age': age,
		'phone': phone,
		'crm': crm,
		'specialty': specialty,
		'category': 'd',
		'associatedClinics': []
	}

	db.User.register(newDoctor, password, function(error, doctor){
		if(error){
			console.log(error);
			callback({error : "Não foi possível salvar o médico",
								message : error});
		}else{
			callback(doctor);
		}
	});
};

exports.update = function(id, fullname, email, password, callback) {

	db.User.findById(id, function(error, doctor) {

		if(fullname) {

			doctor.fullname = fullname;
		}

		if(email) {

			doctor.email = email;
		}

		if(password) {

			doctor.password = password;
		}

		doctor.save(function(error, doctor) {

			if(error) {

				callback({error: 'Não foi possivel salvar o medico',
									message: error});
			} else {

				callback(doctor);
			}
		});
	});
};

exports.delete = function(id, callback) {

	db.User.findById(id, function(error, doctor) {

		if(error) {

			callback({error: 'Não foi possivel retornar o médico',
								message: error});
		} else {

			doctor.remove(function(error) {

				if(!error) {

					callback({response: 'Médico excluido com sucesso'});
				}
			});
		}
	});
};

exports.authenticate = function(email, password, callback){
	db.User.find(email, function(error, doctor){

		if(error) {
			callback({error: 'Não foi possivel retornar o medico',
								message: error});
		} else {
			callback(doctor);
		}
	});
};

exports.addClinic = function(doctorId, clinicId, callback){
  db.User.findById(doctorId , function(error, doctor){
    var errors = false;

    if(error){
      console.log(error);
      errors = true;
      callback({error: "Não foi possível encontrar o médico",
                message: error});
    }else{
      if(doctor.category != 'd'){
        errors = true;
        callback({error: "Não foi possível associar a clínica",
                  message: "Não é possível associar uma clínica a um elemento que não é um médico"});
      }
      userController.user(clinicId, function(resp){
        if(resp['error']){
          errors = true;
          callback({error: "Não foi possível associar a clínica",
                    message: resp["message"]});
        }else{
          if(resp.category != 'c'){
            errors = true;
            callback({error: "Não foi possível associar a clínica",
                      message: "Não é possível associar a um médico, um elemento que não seja uma clínica"});
          }
        }
      });

      if(doctor.associatedClinics.includes(clinicId)){
        errors = true;
        callback({error: "Não foi possível associar a clínica",
                  message: "Clínica já associada"});
      }

      if(!errors){
        doctor.associatedClinics.push(clinicId);
        doctor.save(function(error, doctor){
          if(error){
            console.log(error);
            callback({error: "Não foi possível associar a clínica",
                      message: error});
          }else{
            callback(doctor);
          }
        });
      };
    }
  });
}

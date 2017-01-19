/**
 * MeasurementController
 *
 * @description :: Server-side logic for managing Measurements
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  insertData: function(req, res) {
    if (req.method != "POST") {
      return res.badRequest({msg: "Not POST method."});
    }

    if (!req.body.sensorName) {
      return res.badRequest({msg: "Sensor name is missing."});
    } else if (!req.body.timestamp) {
      return res.badRequest({msg: "Timestamp is missing."});
    } else if (!req.body.value) {
      return res.badRequest({msg: "Value is missing."});
    }
    var query = Sensor.find({name: req.body.sensorName});

    query.then(function (sensors) {
      if (sensors.length < 1) {
        sails.log.info("Sensor doesn't exists.");
        var sensor = Sensor.create({name: req.body.sensorName}).then(function (sensor) {
          return sensor;
        });
      } else {
        sails.log.info("Sensor exists.");
        var sensor = sensors[0];
      }
      return [sensor];
    }).spread(function (sensor) {
      Measurement.create({
        sensor: sensor,
        timestamp: new Date(req.body.timestamp),
        value: req.body.value
      }).then(function (measurement) {
        sails.log.info("Created measurement");
        sails.log.info(measurement);
        return res.ok({msg: "ok"});
      });
    }).catch(function (err) {
      sails.log.error(err);
      return res.serverError(err);
    });


    // TODO: check if sensor exist, when not create it
    // TODO: check if every param like, time and value are there
    // TODO: insert data point to the DB
  },
  getDataForDay: function(req, res) {
    var params = req.allParams();

    if (!params.sensorName) {
      return res.badRequest({msg: "Sensor name is missing."});
    } else if (!params.day) {
      return res.badRequest({msg: "Timestamp is missing."});
    }

    var startTimestamp = new Date(params.day);
    startTimestamp.setHours(0,0,0,0);
    var endTimestamp = new Date(startTimestamp);
    endTimestamp.setDate(endTimestamp.getDate() + 1);

    var findSensor = Sensor.findOne({name: params.sensorName});
    findSensor.then(function (sensor) {
      var measurements = Measurement.find({ timestamp: { '>': startTimestamp, '<': endTimestamp }, sensor: sensor.id }).then( function (measurements) {
        return res.ok({values: measurements});
      });
    }).catch(function (err) {
      sails.log.error(err);
      return res.serverError(err);
    });
  },
  getDataForLastFourHours: function (req, res) {
    var params = req.allParams();

    if (!params.sensorName) {
      return res.badRequest({msg: "Sensor name is missing."});
    }

    var startTimestamp = new Date();
    startTimestamp.setHours(startTimestamp.getHours() - 4);

    var findSensor = Sensor.findOne({name: params.sensorName});
    findSensor.then(function (sensor) {
      var measurements = Measurement.find({ timestamp: { '>': startTimestamp }, sensor: sensor.id }).then( function (measurements) {
        return res.ok({values: measurements});
      });
    }).catch(function (err) {
      sails.log.error(err);
      return res.serverError(err);
    });
  },
  getLatestData: function (req, res) {
    var params = req.allParams();

    if (!params.sensorName) {
      return res.badRequest({msg: "Sensor name is missing."});
    }

    var findSensor = Sensor.findOne({name: params.sensorName});
    findSensor.then(function (sensor) {
      var measurements = Measurement.find().sort("timestamp DESC").limit(1).then( function (measurements) {
        return res.ok({values: measurements});
      });
    }).catch(function (err) {
      sails.log.error(err);
      return res.serverError(err);
    });
  }
};


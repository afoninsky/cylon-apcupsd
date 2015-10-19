'use strict';

var Cylon = require('cylon'),
    Driver = require('../lib/driver'),
    Adaptor = require('../lib/adaptor'),
    fs = require('fs'),
    _ = require('lodash'),
    config = require('config');

describe('Adaptor', function() {
  var adaptor = new Adaptor({ robot: {} });

  it('is a Cylon adaptor', function() {
    expect(adaptor).to.be.an.instanceOf(Cylon.Adaptor);
  });

  it('ensure robot info filled after connect', function (done) {
    adaptor.connect(function (err) {
      var stat = adaptor.stat;
      expect(stat).to.be.a.instanceof(Object);
      expect(stat.MODEL).to.equal('Back-UPS 350');
      done(err);
    });
  });

  it('get UPS state', function (done) {
    adaptor.getState().then(function (info) {
      expect(info).to.be.a.instanceof(Object);
      expect(info.MODEL).to.equal('Back-UPS 350');
      done();
    }).catch(done);
  });

  it('handle event "power" off', function (done) {
    adaptor.once('power', function (isOn) {
      expect(isOn).to.equal(false);
      done();
    });
    fs.appendFileSync(config.apcupsdEventFile, "1 2 3 4 5 Power failure 5 4 3 2 1\n");
  });

  it('handle event "power" on', function (done) {
    adaptor.once('power', function (isOn) {
      expect(isOn).to.equal(true);
      done();
    });
    fs.appendFileSync(config.apcupsdEventFile, "1 2 3 4 5 Power is back 5 4 3 2 1\n");
  });

  it('test states change', function (done) {
    var states = _.clone(adaptor.states),
        oldBin = adaptor.cfg.apcaccessBinary,
        flag = 0;

    var expectedStates = {
      power: false,
      charge: 50,
      timeleft: 41
    };

    expect(states.power).to.equal(true);
    expect(states.charge).to.equal(100);
    expect(states.timeleft).to.equal(43);

    adaptor.cfg.apcaccessBinary = './test/apcaccess.updated';

    function ensureExact (event) {
      return function (current, prev) {
        expect(states[event]).to.equal(prev);
        expect(adaptor.states[event]).to.equal(current);
        if(++flag === 4) { flag = 0; done(); }
      };
    }

    adaptor.once('power', ensureExact('power'));
    adaptor.once('charge', ensureExact('charge'));
    adaptor.once('timeleft', ensureExact('timeleft'));

    adaptor.checkEvents().then(function () {

      _.each(expectedStates, function (v, k) {
        expect(adaptor.states[k]).to.equal(v);
      });

      adaptor.cfg.apcaccessBinary = oldBin;
      if(++flag === 4) { flag = 0; done(); }
    }).catch(done);

  });

  after('empty log', function () {
    fs.truncateSync(config.apcupsdEventFile, 0);
  });

});


// describe('Driver', function() {
//   var driver = new Driver({
//     connection: new Adaptor({ robot: {} })
//   });
//
//   it('is a Cylon driver', function() {
//     expect(driver).to.be.an.instanceOf(Cylon.Driver);
//   });
//
//   it('get device info');
//
//   it('get current power');
//
//   it('get current charge');
//
//   it('get time left');
//
//   it('handle power off');
//
//   it('handle power on');
//
// });

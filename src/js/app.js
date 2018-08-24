App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    //Load course data
    //   $.getJSON('../courses.json', function(data)
    //   {
    //     var courseCostInEth = [];

    //     for (i = 0; i < data.length; i ++)
    //     {
    //       // petTemplate.find('.panel-title').text(data[i].name);
    //       // petTemplate.find('img').attr('src', data[i].picture);
    //       // petTemplate.find('.pet-breed').text(data[i].breed);
    //       // petTemplate.find('.pet-age').text(data[i].age);
    //       // petTemplate.find('.pet-location').text(data[i].location);
    //       // petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

    //       // petsRow.append(petTemplate.html());

    //       courseCostInEth[i] = data[i].costInEth;
    //       console.log("[App.init()] courseCostInEth[" + i + "]=" + data[i].costInEth);
    //     }
    // });

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
  $.getJSON('Adoption.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var AdoptionArtifact = data;
    App.contracts.Adoption = TruffleContract(AdoptionArtifact);

    // Set the provider for our contract
    App.contracts.Adoption.setProvider(App.web3Provider);

    // Use our contract to retrieve and mark the adopted pets
    return App.markAdopted();
  });

  $.getJSON('SignupAndAttendance.json', function(data)
    {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      App.contracts.SignupAndAttendance = TruffleContract(data);

      // Set the provider for our contract
      App.contracts.SignupAndAttendance.setProvider(App.web3Provider);

      console.log("[initContract()] Used SignupAndAttendance.json to instantiate contract artifact and set the provider");
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    //From Pet Shop example
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    //******

    $(document).on('click', '.btn-course-signup', App.handleSignup);
    $(document).on('click', '.btn-login', App.handleStudentLogin);

    $(document).on('click', '.btn-attendance-submit', App.handleAttendanceTaking);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleStudentLogin: function(event)
  {
    console.log("[handleStudentLogin()]");

    event.preventDefault();

    $('.btn-login').attr('disabled', true);
    $('.btn-course-signup').attr('disabled', false);

    var studentName = '';
    var studentEmail ='';

    web3.eth.getAccounts(function(error, accounts)
    {
      if (error)
      {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.SignupAndAttendance.deployed().then(function(_instance)
      {
        //****** https://gist.github.com/robertsimoes/4523a225801739e63b3feb5446f7c6e3
        // And https://www.google.com/search?client=ubuntu&channel=fs&q=solidity+watch&ie=utf-8&oe=utf-8
        // And https://programtheblockchain.com/posts/2018/01/24/logging-and-watching-solidity-events/

        _instance.StudentLoginSuccessful(studentName).watch(function(error, result)
        {
          if (!error)
          {
            console.log("[handleStudentLogin()] StudentLoginSuccessful() event fired. No error");
          }

          else
          {
            console.log("[handleStudentLogin()] StudentLoginSuccessful() error=" + error);
          }
        });
        //******

        return _instance.StudentLogin(msg.sender, studentName, studentEmail, {from: account});
      });
    });
  },

  handleSignup: function(event)
  {
    console.log("[handleSignup()]");

    event.preventDefault();

    var courseId = String(this.getAttribute('data-course-id')); ////https://stackoverflow.com/questions/33760520/get-data-attributes-in-javascript-code#_=_

    console.log('[handleSignup()] ' + 'course-id=' + courseId);

    //var courseId = String($(event.target).data('course-id'));

    console.log("[handleSignup()] courseId=" + courseId);

    $('.btn-course-signup[data-course-id=' + courseId + ']').text('Awaiting payment').attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
    $('.btn-course-signup[data-course-id=' + courseId + ']').append("<img id='loader-1' height='30px' src='https://loading.io/spinners/double-ring/lg.double-ring-spinner.gif'>");

    $('.btn-course-signup[data-course-id!=' + courseId + ']').attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables

    //var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.SignupAndAttendance.deployed().then(function(_instance)
      {
        //****** https://gist.github.com/robertsimoes/4523a225801739e63b3feb5446f7c6e3
        // And https://www.google.com/search?client=ubuntu&channel=fs&q=solidity+watch&ie=utf-8&oe=utf-8
        // And https://programtheblockchain.com/posts/2018/01/24/logging-and-watching-solidity-events/

        _instance.CourseSignupSuccessful(courseId).watch(function(error, result)
        {
          if (!error)
          {
            console.log("[handleSignup()] CourseSignupSuccessful() event fired. No error");
          }

          else
          {
            console.log("[handleSignup()] CourseSignupSuccessful() error=" + error);
          }
        });
        //******

        var costInEth = 0;

        if(courseId != "intro-to-blockchain")
          costInEth = 2;

        console.log("[handleSignup()] _instance=" + _instance);

        //****** https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethfilter
        //And https://ethereum.stackexchange.com/questions/9636/whats-the-proper-way-to-wait-for-a-transaction-to-be-mined-and-get-the-results
        
        var option = 'pending';

        web3.eth.filter(option, function(error, result)
        //web3.eth.filter(option).watch(function(error, result)
        {
          if (!error)
          {
            console.log('[handleSignup()] courseId=' + courseId + ', ' + option + ' block result=' + result);
            //$('.btn-course-signup[data-course-id=' + courseId + ']').text('Enrolled').attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
            $('.btn-course-signup[data-course-id=' + courseId + ']').html('Enrolled<br /><span style="font-size:10px">on ' + new Date(Date.now())).attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
            $('#loader-1').attr('src','');

            $('.btn-attendance-submit[data-button-id=' + courseId + '-attendance]').attr('disabled', false); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
            $('.' + courseId + '-attendance-checkbox').attr('disabled', false); //https://stackoverflow.com/questions/30826769/how-to-disable-checkbox-with-jquery

                       //if($('.btn-course-signup[data-course-id!=' + courseId + ']').text() != 'Enrolled')
            //$('.btn-course-signup[data-course-id!=' + courseId + ']').attr('disabled', false); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables

            if($('.btn-course-signup').text() != 'Enrolled') //http://api.jquery.com/text/
              $('.btn-course-signup[data-course-id!=' + courseId + ']').attr('disabled', false); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables

            else //if($('.btn-course-signup').text() == 'Enrolled')
              $('.btn-course-signup[data-course-id!=' + courseId + ']').attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables

            //web3.eth.filter(option).stopWatching();
          }
          else
          {
            console.log('[handleSignup()] latest block error=' + error);
            //web3.eth.filter(option).stopWatching();
          }

          web3.eth.filter(option).stopWatching();
        });
        //******

        console.log($('.btn-course-signup').text());

        return _instance.Signup(courseId, {from: account, value: costInEth * 1000000000000000000});
        //return _instance.Signup(courseId, {from: account});
      });
    });
  },

  handleAttendanceTaking: function(event)
  {
    console.log('[handleAttendanceTaking()]');
    event.preventDefault();

    var courseCompletedId = '';

    var buttonId = this.getAttribute('data-button-id'); //https://stackoverflow.com/questions/33760520/get-data-attributes-in-javascript-code#_=_
    console.log('[handleAttendanceTaking()] ' + 'button-id=' + buttonId);
  
    courseCompletedId = buttonId.split('-attendance')[0]; //https://www.w3schools.com/jsref/jsref_split.asp

    switch(buttonId)
    {
      case 'intro-to-blockchain-attendance':
        if($('#' + buttonId + '-checkbox-1')[0].checked && $('#' + buttonId + '-checkbox-2')[0].checked)
        {
          $('.btn-attendance-submit[data-button-id=' + buttonId + ']').html('Course Completed<br /><span style="font-size:10px">on ' + new Date(Date.now()) + '</span>').attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
          $('.btn-course-signup[data-course-id=' + courseCompletedId + ']').append('<br /><br />Course Completed<br /><span style="font-size:10px">on ' + new Date(Date.now())).attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables, https://stackoverflow.com/questions/14846506/append-prepend-after-and-before

          $('.' + courseCompletedId + '-attendance-checkbox').attr('disabled', true); //https://stackoverflow.com/questions/30826769/how-to-disable-checkbox-with-jquery

          $('.btn-attendance-submit[data-button-id=' + buttonId + ']').css('color', 'green'); //https://gist.github.com/nathanchen/3243528
          $('.btn-course-signup[data-course-id=' + courseCompletedId + ']').css('color', 'green'); //https://gist.github.com/nathanchen/3243528
        }
        break;
      
      case 'solidity-101-attendance':
        if($('#' + buttonId +'-checkbox-1')[0].checked && $('#' + buttonId + '-checkbox-2')[0].checked)
        {
          $('.btn-attendance-submit[data-button-id=' + buttonId + ']').html('Course Completed<br /><span style="font-size:10px">on ' + new Date(Date.now()) + '</span>').attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
          $('.btn-course-signup[data-course-id=' + courseCompletedId + ']').append('<br /><br />Course Completed<br /><span style="font-size:10px">on ' + new Date(Date.now())).attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables, https://stackoverflow.com/questions/14846506/append-prepend-after-and-before

          $('.' + courseCompletedId + '-attendance-checkbox').attr('disabled', true); //https://stackoverflow.com/questions/30826769/how-to-disable-checkbox-with-jquery

          $('.btn-attendance-submit[data-button-id=' + buttonId + ']').css('color', 'green'); //https://gist.github.com/nathanchen/3243528
          $('.btn-course-signup[data-course-id=' + courseCompletedId + ']').css('color', 'green'); //https://gist.github.com/nathanchen/3243528
        }
        break;

      case 'solidity-102-attendance':
        if($('#' + buttonId +'-checkbox-1')[0].checked && $('#' + buttonId + '-checkbox-2')[0].checked)
        {
          $('.btn-attendance-submit[data-button-id=' + buttonId + ']').html('Course Completed<br /><span style="font-size:10px">on ' + new Date(Date.now()) + '</span>').attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
          $('.btn-course-signup[data-course-id=' + courseCompletedId + ']').append('<br /><br />Course Completed<br /><span style="font-size:10px">on ' + new Date(Date.now())).attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables, https://stackoverflow.com/questions/14846506/append-prepend-after-and-before

          $('.' + courseCompletedId + '-attendance-checkbox').attr('disabled', true); //https://stackoverflow.com/questions/30826769/how-to-disable-checkbox-with-jquery

          $('.btn-attendance-submit[data-button-id=' + buttonId + ']').css('color', 'green'); //https://gist.github.com/nathanchen/3243528
          $('.btn-course-signup[data-course-id=' + courseCompletedId + ']').css('color', 'green'); //https://gist.github.com/nathanchen/3243528
        }
        break;
    }

    console.log('[handleAttendanceTaking()] courseCompletedId=' + courseCompletedId);

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.SignupAndAttendance.deployed().then(function(_instance)
      {
        _instance.AttendanceTaking(courseCompletedId);
      });
    });
  }
}; //End of App

//****** Taken from https://ethereum.stackexchange.com/questions/23549/convert-string-to-bytes32-in-web3j
// public Bytes32 stringToBytes32(String string)
// {
//   byte[] byteValue = string.getBytes();
//   byte[] byteValueLen32 = new byte[32];
//   System.arraycopy(byteValue, 0, byteValueLen32, 0, byteValue.length);
//   return new Bytes32(byteValueLen32);
// }
//******

$(function() {
  $(window).on('load', function() {
    //$('#loader').hide();
    App.init();

    //Disable all course sign up buttons
    $('.btn-course-signup').attr('disabled', true);

    //Disable all attendance-submission buttons
    //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
    $('.btn-attendance-submit[data-button-id="intro-to-blockchain-attendance"]').attr('disabled', true);
    $('.btn-attendance-submit[data-button-id="solidity-101-attendance"]').attr('disabled', true);
    $('.btn-attendance-submit[data-button-id="solidity-102-attendance"]').attr('disabled', true);

    //Disable all attendance-taking checkboxes
    //https://stackoverflow.com/questions/30826769/how-to-disable-checkbox-with-jquery
    $('.intro-to-blockchain-attendance-checkbox').attr('disabled', true);
    $('.solidity-101-attendance-checkbox').attr('disabled', true);
    $('.solidity-102-attendance-checkbox').attr('disabled', true);
  });
});

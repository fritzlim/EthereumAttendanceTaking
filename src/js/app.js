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

    $('.btn-login').html('Please confirm the transaction<br />on MetaMask').css('font-size', '98%').attr('disabled', true);
    $('.btn-login').append("<img id='loader-1' height='30px' src='https://loading.io/spinners/double-ring/lg.double-ring-spinner.gif'>");

    var studentName = $('#student-name-input').val();
    var studentEmail = $('#student-email-input').val();

    console.log('[handleStudentLogin()] studentName=' + studentName);
    console.log('[handleStudentLogin()] studentEmail=' + studentEmail);

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

        _instance.StudentLoginEvent(studentName).watch(function(error, result)
        {
          if (!error)
          {
            console.log("[handleStudentLogin()] StudentLoginEvent() logged in as " + web3.toAscii(result.args.studentName) + ", with email as " + web3.toAscii(result.args.studentEmail) + ". No error");
          }

          else
          {
            console.log("[handleStudentLogin()] StudentLoginEvent() error=" + error);
          }
        });
        //******

        //****** https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethfilter
        //And https://ethereum.stackexchange.com/questions/9636/whats-the-proper-way-to-wait-for-a-transaction-to-be-mined-and-get-the-results
        
        var option = 'pending';
        var date = '';

        web3.eth.filter(option, function(error, result)
        //web3.eth.filter(option).watch(function(error, result)
        {
          if (!error)
          {
            console.log('[handleStudentLogin()] Student logged in. ' + option + ' block result=' + result);

            date = new Date(Date.now());

            $('.btn-login').html('Logged In<br /><span style="font-size:10px">on ' + date).attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
            $('.btn-login').css('color', 'green'); //https://gist.github.com/nathanchen/3243528

            $('#student-name-input').attr('disabled', true);
            $('#student-email-input').attr('disabled', true);
          }
          else
          {
            console.log('[handleStudentLogin()] ' + option + ' block error=' + error);
          }

          web3.eth.filter(option).stopWatching();
        });
        //******

        return _instance.StudentLogin(studentName, studentEmail, date, {from: account});
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

    $('.btn-course-signup[data-course-id=' + courseId + ']').html('Please confirm the transaction<br />on MetaMask').css('font-size', '98%').attr('disabled', true).css('font-size', '98%'); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
    $('.btn-course-signup[data-course-id=' + courseId + ']').append("<img id='loader-1' height='30px' src='https://loading.io/spinners/double-ring/lg.double-ring-spinner.gif'>");

    $('.btn-course-signup[data-course-id!=' + courseId + ']').attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables

    //var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts)
    {
      if (error)
      {
        console.log(error);
      }

      var account = accounts[0];
      var courseData = '';
      var enrolledDate = '';

      App.contracts.SignupAndAttendance.deployed().then(function(_instance)
      {
        //****** https://gist.github.com/robertsimoes/4523a225801739e63b3feb5446f7c6e3
        // And https://www.google.com/search?client=ubuntu&channel=fs&q=solidity+watch&ie=utf-8&oe=utf-8
        // And https://programtheblockchain.com/posts/2018/01/24/logging-and-watching-solidity-events/

        _instance.CourseSignupEvent(courseId).watch(function(error, result)
        {
          if (!error)
          {
            console.log("[handleSignup()] CourseSignupEvent() courseData is " + result.args.courseData + ". No error");
          }

          else
          {
            console.log("[handleSignup()] CourseSignupEvent() error=" + error);
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
        enrolledDate = new Date(Date.now());

        web3.eth.filter(option, function(error, result)
        //web3.eth.filter(option).watch(function(error, result)
        {
          if (!error)
          {
            console.log('[handleSignup()] courseId=' + courseId + ', ' + option + ' block result=' + result);
            
            //****** The enrolledDate should be retrieved here, but if it is, then enrolledDate is undefined when Signup() is called in the smart contract because web3.eth.filer() isn't awaited
            //enrolledDate = new Date(Date.now());
            //***********************************************************************************************************************************************************************************

            $('.btn-course-signup[data-course-id=' + courseId + ']').html('Enrolled<br /><span style="font-size:10px">on ' + enrolledDate).attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
            
            //****** This isn't working ******/
            $('.btn-course-signup[data-course-id=' + courseId + ']').addClass('enrolled-course'); //https://www.w3schools.com/jquery/jquery_css_classes.asp
            //********************************/

            $('.btn-attendance-submit[data-button-id=' + courseId + '-attendance]').attr('disabled', false); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
            $('.' + courseId + '-attendance-checkbox').attr('disabled', false); //https://stackoverflow.com/questions/30826769/how-to-disable-checkbox-with-jquery

                       //if($('.btn-course-signup[data-course-id!=' + courseId + ']').text() != 'Enrolled')
            //$('.btn-course-signup[data-course-id!=' + courseId + ']').attr('disabled', false); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables



            //if($('.btn-course-signup').text() != 'Enrolled') //http://api.jquery.com/text/
            //  $('.btn-course-signup[data-course-id!=' + courseId + ']').attr('disabled', false); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables

            //else //if($('.btn-course-signup').text() == 'Enrolled')

            //****** This isn't working ******/
            if(!$('.btn-course-signup').hasClass('enrolled-course'))
              $('.btn-course-signup[data-course-id!=' + courseId + ']').attr('disabled', false); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
            //********************************/

            $('.btn-course-signup[data-course-id!=' + courseId + ']').attr('disabled', false); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
            
            //$('.enrolled-course').attr('disabled', true);
            //if(!$('.btn-course-signup').hasClass('enrolled-course'))
            //  $('.btn-course-signup').attr('disabled', false); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables            

            //if($('.btn-course-signup').text() != 'Enrolled') //http://api.jquery.com/text/
            //  $('.btn-course-signup[data-course-id!=' + courseId + ']').attr('disabled', false); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables            
          
            courseData = enrolledDate + ':' + courseId;
            console.log('[handleSignup()] courseData=' + courseData);

            //_instance.Signup(courseId, courseData, {from: account, value: costInEth * 1000000000000000000});
          }
          else
          {
            console.log('[handleSignup()] ' + option + ' block error=' + error);
          }

          web3.eth.filter(option).stopWatching();
        });
        //******

        //console.log($('.btn-course-signup').text());

        // var courseData = enrolledDate + ':' + courseId;
        // console.log('[handleSignup()] courseData=' + courseData);

        return _instance.Signup(courseId, courseData, {from: account, value: costInEth * 1000000000000000000});
      });
    });
  },

  handleAttendanceTaking: function(event)
  {
    console.log('[handleAttendanceTaking()]');
    event.preventDefault();

    var courseCompletedId = '';
    var date = '';

    var buttonId = this.getAttribute('data-button-id'); //https://stackoverflow.com/questions/33760520/get-data-attributes-in-javascript-code#_=_
    console.log('[handleAttendanceTaking()] ' + 'button-id=' + buttonId);
  
    courseCompletedId = buttonId.split('-attendance')[0]; //https://www.w3schools.com/jsref/jsref_split.asp
    
    date = new Date(Date.now());

    switch(buttonId)
    {
      case 'intro-to-blockchain-attendance':
        if($('#' + buttonId + '-checkbox-1')[0].checked && $('#' + buttonId + '-checkbox-2')[0].checked)
        {
          $('.btn-attendance-submit[data-button-id=' + courseCompletedId + '-attendance]').html('Please confirm the transaction<br />on MetaMask').css('font-size', '98%').attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables, https://stackoverflow.com/questions/14846506/append-prepend-after-and-before
          $('.btn-attendance-submit[data-button-id=' + courseCompletedId + '-attendance]').append("<img id='loader-1' height='30px' src='https://loading.io/spinners/double-ring/lg.double-ring-spinner.gif'>");
        }
        break;
      
      case 'solidity-101-attendance':
        if($('#' + buttonId +'-checkbox-1')[0].checked && $('#' + buttonId + '-checkbox-2')[0].checked)
        {
          $('.btn-attendance-submit[data-button-id=' + courseCompletedId + '-attendance]').html('Please confirm the transaction<br />on MetaMask').css('font-size', '98%').attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables, https://stackoverflow.com/questions/14846506/append-prepend-after-and-before
          $('.btn-attendance-submit[data-button-id=' + courseCompletedId + '-attendance]').append("<img id='loader-1' height='30px' src='https://loading.io/spinners/double-ring/lg.double-ring-spinner.gif'>");
        }
        break;

      case 'solidity-102-attendance':
        if($('#' + buttonId +'-checkbox-1')[0].checked && $('#' + buttonId + '-checkbox-2')[0].checked)
        {
          $('.btn-attendance-submit[data-button-id=' + courseCompletedId + '-attendance]').html('Please confirm the transaction<br />on MetaMask').css('font-size', '98%').attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables, https://stackoverflow.com/questions/14846506/append-prepend-after-and-before
          $('.btn-attendance-submit[data-button-id=' + courseCompletedId + '-attendance]').append("<img id='loader-1' height='30px' src='https://loading.io/spinners/double-ring/lg.double-ring-spinner.gif'>");
        }
        break;
    }

    console.log('[handleAttendanceTaking()] courseCompletedId=' + courseCompletedId);

    web3.eth.getAccounts(function(error, accounts)
    {
      if (error)
      {
        console.log(error);
      }

      //****** https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethfilter
      //And https://ethereum.stackexchange.com/questions/9636/whats-the-proper-way-to-wait-for-a-transaction-to-be-mined-and-get-the-results
      
      var option = 'pending';
      var date = '';

      web3.eth.filter(option, function(error, result)
      //web3.eth.filter(option).watch(function(error, result)
      {
        if (!error)
        {
          console.log('[handleAttendanceTaking()] courseCompletedId=' + courseCompletedId + ', ' + option + ' block result=' + result);
          
          date = new Date(Date.now());

          $('.btn-attendance-submit[data-button-id=' + courseCompletedId + '-attendance]').html('Course Completed<br /><span style="font-size:10px">on ' + date).attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
          $('.btn-attendance-submit[data-button-id=' + courseCompletedId + '-attendance]').css('color', 'green'); //https://gist.github.com/nathanchen/3243528

          $('.btn-attendance-submit[data-button-id=' + courseCompletedId + '-attendance]').attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
          $('.' + courseCompletedId + '-attendance-checkbox').attr('disabled', true); //https://stackoverflow.com/questions/30826769/how-to-disable-checkbox-with-jquery
        
          $('.btn-course-signup[data-course-id=' + courseCompletedId + ']').append('<br /><br />Course Completed<br /><span style="font-size:10px">on ' + date).attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables, https://stackoverflow.com/questions/14846506/append-prepend-after-and-before
          $('.btn-course-signup[data-course-id=' + courseCompletedId + ']').css('color', 'green'); //https://gist.github.com/nathanchen/3243528
          $('.btn-course-signup[data-course-id=' + courseCompletedId + ']').attr('disabled', true); //https://gist.github.com/nathanchen/3243528        
        }
        else
        {
          console.log('[handleAttendanceTaking()] ' + option + ' block error=' + error);
        }

        web3.eth.filter(option).stopWatching();
      });
      //******

      var account = accounts[0];

      var courseData = date + ':' + courseCompletedId;

      App.contracts.SignupAndAttendance.deployed().then(function(_instance)
      {
        _instance.AttendanceTaking(courseData, {from: account});
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

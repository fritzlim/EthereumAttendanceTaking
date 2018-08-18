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

  handleSignup: function(event)
  {
    console.log("[handleSignup()]");

    event.preventDefault();

    console.log('[handleSignup()] ' + 'course-id=' + this.getAttribute('data-course-id')); //https://stackoverflow.com/questions/33760520/get-data-attributes-in-javascript-code#_=_

    var courseId = String($(event.target).data('course-id'));
    console.log("[handleSignup()] courseId=" + courseId);

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
            // No error
            console.log("[handleSignup()] Event fired. No error");
            $('.btn-course-signup[data-course-id=' + courseId + ']').text('Enrolled').attr('disabled', true); //https://stackoverflow.com/questions/4893436/jquery-selectors-with-variables
          }

          else
          {
            // Error
            console.log("[handleSignup()] CourseSignupSuccessful() error=" + error);
          }
        });
        //******

        var costInEth = 0;

        if(courseId != "intro-to-blockchain")
          costInEth = 2;

        console.log("[handleSignup()] _instance=" + _instance);
        return _instance.Signup(courseId, {from: account, value: costInEth * 1000000000000000000});
        //return _instance.Signup(courseId, {from: account});
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
    App.init();
  });
});

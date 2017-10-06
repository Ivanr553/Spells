
const Alexa = require('alexa-sdk')
const request = require('request')

const handlers = {
    //Main intent
    'Spell' : function() {

      //Initiating variables for different slots
      const spellName = this.event.request.intent.slots.spellName.value;
      const spellQuality = this.event.request.intent.slots.spellQuality.value;

      //initiating variable for this to use in getSpellId function
      const that = this;

      //Checking if alexa was able to find the spell stated
      if(!spellName) {

        console.log('spell not found')

        let speechOutput = 'Sorry, I couldn\'t find that spell'

        return that.emit(':tell', speechOutput)
      }

      // if(spellName != undefined && spellQuality == undefined) {
      //
      //   let speechOutput = 'Sorry, I couldn\'t find that information for ' + spellName
      //
      //   that.emit(':tell', speechOutput)
      // }

      //Checking to see if user is making a specific request
      if(spellQuality) {

        if(spellQuality === 'description') {

          //Calling function to search API for the spellName
          getSpellId(spellName, function(data) {
            let speechOutput
            let textOutput = ' '

            //If spell was not found
            if(data === ('I couldn\'t find ' + spellName)) {

              return that.emit(':tell', data)
            }

            //Checking to see if desc has multiple objects
            if(data.desc.length > 1) {

              //Assigning the speechOutput to be the first object in the array
              speechOutput = data.desc[0]

              for(let i = 0; i < data.desc.length; i++) {

                //Checking to see if it the first entr to avoid an extra space
                if(i === 0) {

                  textOutput += data.desc[i]
                } else {

                  textOutput += ' ' + data.desc[i]
                }
              }

              that.emit(":tellWithCard", speechOutput, spellName, textOutput)
            } else {

              //Assigning speechOutput to the description of the spell
              speechOutput = data.desc[0]

              // Emitting the spell description through alexa
              that.emit(":tellWithCard", speechOutput, spellName, speechOutput)

            }
          })

        }

        else if(spellQuality === 'range') {

          getSpellId(spellName, function(data) {

            //If spell was not found
            if(data === ('I couldn\'t find ' + spellName)) {

              return that.emit(':tell', data)
            }

            let speechOutput = 'The range on ' + spellName + ' is ' + data.range
            let textOutput = data.range

            that.emit(":tellWithCard", speechOutput, spellName, textOutput)
          })

        }

        else if(spellQuality === 'damage') {

          //Calling api to find spell
          getSpellId(spellName, function(data) {

            let speechOutput
            let textOutput
            let description

            //If spell was not found
            if(data === ('I couldn\'t find ' + spellName)) {

              return that.emit(':tell', data)
            }

            //Checking for description array length, if more than 1 then combining all strings together
            if(data.desc.length === 1) {

              description = data.desc[0]
            } else {

              for(let i = 0; i < data.desc.length; i++) {

                if(i === 0) {

                  description = data.desc[i]
                } else {

                  description += ' ' + data.desc[i]
                }
              }
            }

            //Assigning damage to variable
            speechOutput = findDamage(spellName, description)

            that.emit(':tellWithCard', speechOutput, spellName, speechOutput)
          })


        }

        else if(spellQuality === 'healing' || spellQuality === 'heal') {

          //Calling api to find spell
          getSpellId(spellName, function(data) {

            let speechOutput
            let textOutput
            let description

            //If spell was not found
            if(data === ('I couldn\'t find ' + spellName)) {

              return that.emit(':tell', data)
            }

            //Checking for description array length, if more than 1 then combining all strings together
            if(data.desc.length === 1) {

              description = data.desc[0]
            } else {

              for(let i = 0; i < data.desc.length; i++) {

                if(i === 0) {

                  description = data.desc[i]
                } else {

                  description += ' ' + data.desc[i]
                }
              }
            }

            //Assigning damage to variable
            speechOutput = findHealing(spellName, description)

            that.emit(':tellWithCard', speechOutput, spellName, speechOutput)
          })


        }

        else if (spellQuality === 'action cost' || spellQuality === 'casting time') {

          getSpellId(spellName, function(data) {

            //If spell was not found
            if(data === ('I couldn\'t find ' + spellName)) {

              that.emit(':tell', data)
            }

            let speechOutput = 'The ' + spellQuality + ' on ' + spellName + ' is ' + data.casting_time
            let textOutput = data.casting_time

            that.emit(':tellWithCard', speechOutput, spellName, textOutput)
          })

        }

        else if(spellQuality === 'page' || spellQuality === 'page number') {

          getSpellId(spellName, function(data) {

            //If spell was not found
            if(data === ('I couldn\'t find ' + spellName)) {

              that.emit(':tell', data)
            }

            let page = data.page.slice(4)
            let speechOutput = 'The page for ' + spellName + ' is ' + page
            let textOutput = page

            that.emit(':tellWithCard', speechOutput, spellName, textOutput)
          })

        }

        else if(spellQuality === 'duration' || spellQuality === 'last' || spellQuality === 'lasts') {

          getSpellId(spellName, function(data) {

            //If spell was not found
            if(data === ('I couldn\'t find ' + spellName)) {

              that.emit(':tell', data)
            }

            let duration = data.duration
            let speechOutput = spellName + '\'s duration is ' + duration
            let textOutput = duration

            that.emit(':tellWithCard', speechOutput, spellName + ' duration', textOutput)
          })

        }

        else if(spellQuality === 'level' || spellQuality === 'when') {

          getSpellId(spellName, function(data) {

            //If spell was not found
            if(data === ('I couldn\'t find ' + spellName)) {

              that.emit(':tell', data)
            }

            let level = data.level
            let speechOutput = 'The level requirement for ' + spellName + ' is ' + level
            let textOutput = level

            that.emit(':tellWithCard', speechOutput, spellName + '\'s level requirement', textOutput)
          })

        }

        else if(spellQuality === 'concentration') {

          getSpellId(spellName, function(data) {

            //If spell was not found
            if(data === ('I couldn\'t find ' + spellName)) {

              that.emit(':tell', data)
            }

            let concentration = data.concentration

            //Checking what the response is and formatting a yes or no outputs
            if(concentration === 'yes')  {

              let speechOutput = spellName + ' requires concentration'
              let textOutput = concentration

              that.emit(':tellWithCard', speechOutput, speechOutput + ' concentration', textOutput)
            } else {

              let speechOutput = spellName + ' does not require concentration'
              let textOutput = concentration

              that.emit(':tellWithCard', speechOutput, spellName + ' concentration', textOutput)
            }

          })

        }

      //Else case for general description
      } else {

        //Calling function to search API for the spellName
        getSpellId(spellName, function(data) {

          let speechOutput
          let textOutput = ' '

          //If spell was not found
          if(data === ('I couldn\'t find ' + spellName)) {

            that.emit(':tell', data)
          }

          //Checking to see if desc has multiple objects
          if(data.desc.length > 1) {

            //Assigning the speechOutput to be the first object in the array
            speechOutput = data.desc[0]

            for(let i = 0; i < data.desc.length; i++) {

              //Checking to see if it the first entr to avoid an extra space
              if(i === 0) {

                textOutput += data.desc[i]
              } else {

                textOutput += ' ' + data.desc[i]
              }
            }

            that.emit(":tellWithCard", speechOutput, spellName, textOutput)
          } else {

            //Assigning speechOutput to the description of the spell
            speechOutput = data.desc[0]

            // Emitting the spell description through alexa
            that.emit(":tellWithCard", speechOutput, spellName, speechOutput)

          }
        })

      }
  }
};

//Function to edit string to allow use in url
function editString(input) {
  let string = input

  string = string.charAt(0).toUpperCase() + string.slice(1)

  while (string.indexOf(' ') > 0) {

    string = string.slice(0, string.indexOf(' ')) + '+' + string.charAt(string.indexOf(' ') + 1).toUpperCase() + string.slice(string.indexOf(' ') + 2)
  }

  console.log(string)

  return string
}

//Function to make api call
function getSpellId(spellName, callback) {


  let url = 'http://www.dnd5eapi.co/api/spells/?name=' + editString(spellName)

  request.get(url, function(error, response, body) {

    console.log('request made')

    if(error) {

      callback(error)
    } else {

      //Parsing body of request
      let d = JSON.parse(body);

      //Checking to see if response contained a spell
      if(d.results.length <= 0) {

        data = 'I couldn\'t find ' + spellName

        return callback(data)
      }


      url = d.results[0].url;

      getSpellInfo(url, function(data) {

        callback(data)
      })
    }
  })
}

//Fucntion that finds the data from the obtained spell ID
function getSpellInfo(url, callback) {
  console.log('second request made')
  request.get(url, function(error, response, body) {
    if(error) {
      callback(error)
    } else {
      d = JSON.parse(body)
      callback(d)
    }
  })
}

//Create two functinos to look for either healing or damage!
function findHealing(spellName, input) {

  let output

  for(let i = 0; i < input.length; i++) {

  //Will find character 'd' and check around it to see if there is a dice roll
  if(input.charAt(i) === 'd' ) {

    //Checking for dice continued
    if(!isNaN(input.charAt(i + 1)) && input.charAt(i + 1) != ' ' && input.charAt(i + 1) != '.') {

      //Assigning variables for size of slice
      let start = i - 1
      let end = i + 2

      //Assigning the dice found to variable
      let foundDice = input.slice(start, end)

      //Checking to see if number of dice is double digits
      if(input.charAt(start - 1) != ' ') {

        //Adjusting dice amount to account for double digits
        start -= 1

        foundDice = input.slice(start, end)
      }

      //Checking if the dice size is double digits
      if(input.charAt(end + 1) != ' ') {

        //Adjusting dice size to account for double digits
        end += 1

        foundDice = input.slice(start, end)
      }

        //Checking to see if the spell text contains the word regain
        if(input.indexOf('regain')) {

          //Constructing base healing
          output = spellName + ' heals for ' + foundDice

          //Checking to see if modifiers are used for healing
          if(input.charAt(input.indexOf(foundDice) + 4) == '+' ) {

            //Constructing modified output
            output += ' + your spellcasting modifier'

            return output
          }

        } else {

          //Found no regain, returning no healing found
          output = spellName + ' does no healing'

          return output
        }

      }
    }
  }
}


//Function to find damage of a spell
function findDamage(spellName, input) {

  let answer = []

  let damageTypes = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder']

  for(let i = 0; i < input.length; i++) {

    //Will find character 'd' and check around it to see if there is a damage roll
    if(input.charAt(i) === 'd' ) {

      //Checking for dice continued
      if(!isNaN(input.charAt(i + 1)) && input.charAt(i + 1) != ' ' && input.charAt(i + 1) != '.') {

        //Assigning variables for size of slice
        let start = i - 1
        let end = i + 2

        //Assigning the dice found to variable
        let foundDice = input.slice(start, end)

        //Checking to see if number of dice is double digits
        if(input.charAt(start - 1) != ' ') {

          //Adjusting dice amount to account for double digits
          start -= 1

          foundDice = input.slice(start, end)
        }

        //Checking if the dice size is double digits
        if(input.charAt(end + 1) != ' ') {

          //Adjusting dice size to account for double digits
          end += 1

          foundDice = input.slice(start, end)
        }

        //Assignging the word after the dice to a variable to check for type
        let foundType = input.slice(i + 3).slice(0, input.slice(i + 3).indexOf(' '))

        //Looping through damage types to see if the spell deals damage
        for(let j = 0; j < damageTypes.length; j++) {

          //Checking the word after the dice to see if it matched a damage type
          if(damageTypes[j] == foundType) {


            //Formatting answer if damage type was found
            let output = foundDice + ' ' + foundType + ' damage'

            //Pushing formatted damage string to answer array
            answer.push(output)
          }

          //Checking to see if the spell heals
          if(j === damageTypes.length -1 && !answer.length) {

            //Checking to see if the spell text contains the word regain
            if(input.indexOf('regain')) {

              //Finding base healing
              output = spellName + ' heals for ' + foundDice
              if(input.charAt(input.indexOf(foundDice) + 4) == '+' ) {
                output += ' + your spellcasting modifier'
                return output
              }

            }
          }


        }
      }
    }
  }

  //Checking if any damage was found
  if(!answer.length) {

    answer = spellName + ' deals no damage'
  } else {

    //Creating output variable
    let output

    //If there are multiple damage values
    if(answer.length > 1) {

      //Looping through damage variables to construct output
      for(let i = 0; i < answer.length; i++) {

        //checking to see if this is the first item to format the answer correctly
        if(i === 0) {

          output = spellName + ' deals ' + answer[i]
        } else {

          output += ' and ' + answer[i]
        }
      }

      //Returning the modified answer
      return output

    //If only one damage source was found
    } else {

      return spellName + ' deals ' + answer[0]
    }
  }

  return answer
}

//Exporting handler
exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

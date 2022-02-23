var jsPsychVideoKeyboardResponse = (function (jspsych) {
  'use strict';

  const info = {
      name: "video-keyboard-response",
      parameters: {
          /** Array of the video file(s) to play. Video can be provided in multiple file formats for better cross-browser support. */
          stimulus: {
              type: jspsych.ParameterType.VIDEO,
              pretty_name: "Video",
              default: undefined,
              array: true,
          },
          /** Array containing the key(s) the subject is allowed to press to respond to the stimulus. */
          choices: {
              type: jspsych.ParameterType.KEYS,
              pretty_name: "Choices",
              default: "ALL_KEYS",
          },
          /** Any content here will be displayed below the stimulus. */
          prompt: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Prompt",
              default: null,
          },
          /** The width of the video in pixels. */
          width: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Width",
              default: "",
          },
          /** The height of the video display in pixels. */
          height: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Height",
              default: "",
          },
          /** If true, the video will begin playing as soon as it has loaded. */
          autoplay: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Autoplay",
              default: true,
          },
          /** If true, the subject will be able to pause the video or move the playback to any point in the video. */
          controls: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Controls",
              default: false,
          },
          /** If true, the mask will appear on the video */
          mask: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "mask",
              default: true,
          },
          /** How long should the flicker duration be. */
          flicker_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Flicker duration",
              default: null,
          },
          /** How frequently should the flicker happen. */
          flicker_frequency: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Flicker frequency",
              default: null,
          },
          /** Time to start the clip. If null (default), video will start at the beginning of the file. */
          start: {
              type: jspsych.ParameterType.FLOAT,
              pretty_name: "Start",
              default: null,
          },
          /** Time to stop the clip. If null (default), video will stop at the end of the file. */
          stop: {
              type: jspsych.ParameterType.FLOAT,
              pretty_name: "Stop",
              default: null,
          },
          /** The playback rate of the video. 1 is normal, <1 is slower, >1 is faster. */
          rate: {
              type: jspsych.ParameterType.FLOAT,
              pretty_name: "Rate",
              default: 1,
          },
          /** If true, the trial will end immediately after the video finishes playing. */
          trial_ends_after_video: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "End trial after video finishes",
              default: false,
          },
          /** How long to show trial before it ends. */
          trial_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Trial duration",
              default: null,
          },
          /** If true, the trial will end when subject makes a response. */
          response_ends_trial: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Response ends trial",
              default: true,
          },
          /** If true, then responses are allowed while the video is playing. If false, then the video must finish playing before a response is accepted. */
          response_allowed_while_playing: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Response allowed while playing",
              default: true,
          },
      },
  };
  /**
   * **video-keyboard-response**
   *
   * jsPsych plugin for playing a video file and getting a keyboard response
   *
   * @author Josh de Leeuw
   * @see {@link https://www.jspsych.org/plugins/jspsych-video-keyboard-response/ video-keyboard-response plugin documentation on jspsych.org}
   */
  class VideoKeyboardResponsePlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {
          // catch mistake where stimuli are not an array
          if (!Array.isArray(trial.stimulus)) {
              throw new Error(`
        The stimulus property for the video-keyboard-response plugin must be an array
        of files. See https://www.jspsych.org/latest/plugins/video-keyboard-response/#parameters
      `);
          }
          // setup stimulus
          var video_html = "<div>";
            for(let stim=0; stim < trial.stimulus.length; stim++){video_html += '<video id='+'"video_'+stim.toString()+'"'+'style="position:absolute;left:25%;bottom:25%;right:25%;top:25%"';
            if (trial.width) {
                video_html += ' width="' + trial.width + '"';
            }
            if (trial.height) {
                video_html += ' height="' + trial.height + '"';
            }
            if (trial.autoplay && trial.start == null) {
                // if autoplay is true and the start time is specified, then the video will start automatically
                // via the play() method, rather than the autoplay attribute, to prevent showing the first frame
                video_html += " autoplay ";
            }
            if (trial.controls) {
                video_html += " controls ";
            }
            if (trial.start !== null) {
                // hide video element when page loads if the start time is specified,
                // to prevent the video element from showing the first frame
                video_html += ' style="visibility: hidden;"';
            }
            video_html += ">";
            var video_preload_blob = this.jsPsych.pluginAPI.getVideoBuffer(trial.stimulus[stim]);
            if (!video_preload_blob) {
                var file_name = trial.stimulus[stim];
                if (file_name.indexOf("?") > -1) {
                    file_name = file_name.substring(0, file_name.indexOf("?"));
                }
                var type = file_name.substr(file_name.lastIndexOf(".") + 1);
                type = type.toLowerCase();
                if (type == "mov") {
                    console.warn("Warning: video-keyboard-response plugin does not reliably support .mov files.");
                }
                video_html += '<source src="' + file_name + '" type="video/' + type + '">';
            }
            video_html += "</video>";}

          if(trial.mask){
            video_html += '<img src="./mask.png" id="mask" style="position:absolute;left:25%;bottom:25%;right:25%;top:25%"';
            if (trial.width) {
                video_html += ' width=' + trial.width + ';';
            }
            if (trial.height) {
                video_html += ' height=' + trial.height + ';';
            }
            video_html += ' >';
          }
          video_html += "</div>";
          // add prompt if there is one
          if (trial.prompt !== null) {
              video_html += trial.prompt;
          }
          display_element.innerHTML = video_html;

          // Define the flickering scenario
          var timeoutID;
          var flickerTimeOut;
          if (timeoutID){
            clearTimeout(timeoutID);
            timeoutID = 'null';
          }
          function show_flicker(mask){
            mask.style.visibility='visible';
            var flicker_duration = trial.flicker_duration;
            flickerTimeOut = setTimeout(()=>{mask.style.visibility='hidden';},flicker_duration);
          }
          var counter = 0;
          var magnitude_jump = [0, 500, 1000];
          var direction = 'forward';
          function change_video(magnitude_jump){
            if (counter % 4 ==3){
              counter += 1;
              if (direction == 'forward'){
                var jump = magnitude_jump.pop();
                console.log(jump);
                direction = 'reverse';
                if (jump == 500){
                  console.log("Forward:500");
                  video_1.style.opacity = 1;
                  video_2.style.opacity = 0;
                  video_0.style.opacity = 0;
                }
                else if(jump == 1000){
                  console.log("Forward:1000");
                  video_2.style.opacity = 1;
                  video_0.style.opacity = 0;
                  video_1.style.opacity = 0;
                }
              }
              else{ // jump back to the original video
                console.log("Reverse");
                video_0.style.opacity = 1;
                video_1.style.opacity = 0;
                video_2.style.opacity = 0;
                direction = 'forward';
              }


            }
            else{
              counter += 1;
            }
          }

          function flicker(mask){
            var flicker_frequency = trial.flicker_frequency;
            change_video(magnitude_jump);
            timeoutID = setTimeout(()=>{flicker(mask); show_flicker(mask)},flicker_frequency);
          }
          var mask = document.querySelector('#mask');
          mask.style.visibility = 'hidden';

          var video_0 = document.querySelector('#video_0');
          var video_1 = document.querySelector('#video_1');
          var video_2 = document.querySelector('#video_2');

          video_1.style.opacity = 0;
          video_2.style.opacity = 0;

          if (trial.flicker_duration != 'null' && trial.flicker_frequency != 'null'){
            flicker(mask);
          }

          // Define the end of trial scenario
          var onended = () => {
              if (trial.trial_ends_after_video) {
                  end_trial();
                  clearTimeout(timeoutID);
                  clearTimeout(flickerTimeOut);
                  timeoutID = 'null';
              }
              if (trial.response_allowed_while_playing == false && !trial.trial_ends_after_video) {
                  // start keyboard listener
                  this.jsPsych.pluginAPI.getKeyboardResponse({
                      callback_function: after_response,
                      valid_responses: trial.choices,
                      rt_method: "performance",
                      persist: false,
                      allow_held_key: false,
                  });
              }
          };

          var video_element = []
          for (let stim=0; stim < trial.stimulus.length; stim++){
            video_element.push(display_element.querySelector('#video_'+stim.toString()));
            if (video_preload_blob) {
                video_element[stim].src = video_preload_blob;
            }
            video_element[stim].playbackRate = trial.rate;
            video_element[stim].onended = onended
            // if video start time is specified, hide the video and set the starting time
            // before showing and playing, so that the video doesn't automatically show the first frame
            if (trial.start !== null) {
                video_element[stim].pause();
                video_element[stim].onseeked = () => {
                    video_element[stim].style.visibility = "visible";
                    video_element[stim].muted = false;
                    if (trial.autoplay) {
                        video_element[stim].play();
                    }
                    else {
                        video_element[stim].pause();
                    }
                    video_element[stim].onseeked = () => { };
                };
                video_element[stim].onplaying = () => {
                    video_element[stim].currentTime = trial.start;
                    video_element[stim].onplaying = () => { };
                };
                // fix for iOS/MacOS browsers: videos aren't seekable until they start playing, so need to hide/mute, play,
                // change current time, then show/unmute
                video_element[stim].muted = true;
                video_element[stim].play();
            }
            let stopped = false;
            if (trial.stop !== null) {
                video_element[stim].addEventListener("timeupdate", (e) => {
                    var currenttime = video_element[stim].currentTime;
                    if (currenttime >= trial.stop) {
                        if (!trial.response_allowed_while_playing) {
                            this.jsPsych.pluginAPI.getKeyboardResponse({
                                callback_function: after_response,
                                valid_responses: trial.choices,
                                rt_method: "performance",
                                persist: false,
                                allow_held_key: false,
                            });
                        }
                        video_element[stim].pause();
                        if (trial.trial_ends_after_video && !stopped) {
                            // this is to prevent end_trial from being called twice, because the timeupdate event
                            // can fire in quick succession
                            stopped = true;
                            end_trial();
                            clearTimeout(timeoutID);
                            clearTimeout(flickerTimeOut);
                            timeoutID = 'null'
                        }
                    }
                });
            }
          }


          // store response
          var response = {
              rt: [],
              key: [],
          };
          // function to end trial when it is time
          const end_trial = () => {
              // kill any remaining setTimeout handlers
              this.jsPsych.pluginAPI.clearAllTimeouts();
              // kill keyboard listeners
              this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
              // stop the video file if it is playing
              // remove end event listeners if they exist
              for(let stim = 0; stim < trial.stimulus.length; stim++){
                display_element
                    .querySelector('#video_'+stim.toString())
                    .pause();
                display_element.querySelector('#video_'+stim.toString()).onended = () => { };
              }

              // gather the data to store for the trial
              var trial_data = {
                  rt: JSON.stringify(response.rt),
                  stimulus: trial.stimulus,
                  response: JSON.stringify(response.key),
              };
              // clear the display
              display_element.innerHTML = "";
              // move on to the next trial
              this.jsPsych.finishTrial(trial_data);
          };
          // function to handle responses by the subject
          var after_response = (info) => {
              // after a valid response, the stimulus will have the CSS class 'responded'
              // which can be used to provide visual feedback that a response was recorded
              for(let stim = 0; stim < trial.stimulus.length; stim++){
                display_element.querySelector('#video_'+stim.toString()).className +=
                    " responded";
              }

              // record all the responses
              console.log(info)
              response.rt.push(info.rt);
              response.key.push(info.key);
              if (trial.response_ends_trial) {
                  end_trial();
              }
          };
          // start the response listener
          if (trial.choices != "NO_KEYS" && trial.response_allowed_while_playing) {
            console.log(info)
              this.jsPsych.pluginAPI.getKeyboardResponse({
                  callback_function: after_response,
                  valid_responses: trial.choices,
                  rt_method: "performance",
                  persist: true,
                  allow_held_key: false,
              });
          }
          // end trial if time limit is set
          if (trial.trial_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
          }
      }
      simulate(trial, simulation_mode, simulation_options, load_callback) {
          if (simulation_mode == "data-only") {
              load_callback();
              this.simulate_data_only(trial, simulation_options);
          }
          if (simulation_mode == "visual") {
              this.simulate_visual(trial, simulation_options, load_callback);
          }
      }
      simulate_data_only(trial, simulation_options) {
          const data = this.create_simulation_data(trial, simulation_options);
          this.jsPsych.finishTrial(data);
      }
      simulate_visual(trial, simulation_options, load_callback) {
          const data = this.create_simulation_data(trial, simulation_options);
          const display_element = this.jsPsych.getDisplayElement();
          this.trial(display_element, trial);
          load_callback();
          const video_element = display_element.querySelector("#jspsych-video-button-response-stimulus");
          const respond = () => {
              if (data.rt !== null) {
                  this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
              }
          };
          if (!trial.response_allowed_while_playing) {
              video_element.addEventListener("ended", respond);
          }
          else {
              respond();
          }
      }
      create_simulation_data(trial, simulation_options) {
          const default_data = {
              stimulus: trial.stimulus,
              rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
              response: this.jsPsych.pluginAPI.getValidKey(trial.choices),
          };
          const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
          this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
          return data;
      }
  }
  VideoKeyboardResponsePlugin.info = info;

  return VideoKeyboardResponsePlugin;

})(jsPsychModule);

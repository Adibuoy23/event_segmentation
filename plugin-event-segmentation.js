var jsPsychEventSegmentation = (function (jspsych) {
  'use strict';

  const info = {
      name: "event-segmentation-video-response",
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
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Prompt",
              default: true,
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
          /** If true, the subject will be able to pause the video or move the playback to any point in the video. */
          mute: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Mute",
              default: false,
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
          /** participant id */
          participant_id: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Participant ID",
              default: undefined,
      },
  }
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
          document.body.style.cursor = 'none';
          var video_style = ["position:relative;top:0;left:0;",
          "position:absolute;top:0;left:0;",
          "position:absolute;top:0;left:0;"];
          // setup stimulus
          var video_preload_blob = [];

          var video_html = '<div style = "position:relative;top:0;left:0;">'
            for(let stim=0; stim < trial.stimulus.length; stim++){video_html += '<video id='+'"video_'+stim.toString()+'"'+'style="'+video_style[stim]+'"';
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
            video_preload_blob.push(this.jsPsych.pluginAPI.getVideoBuffer(trial.stimulus[stim]));
            if (!video_preload_blob[stim]) {
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

          video_html += '<div id="feedback" style="position:absolute;color:white;text-align:center;top:50%;left:50%;right:0">'+""+'</div>';
          video_html += "</div>";

          video_html += '<div style = "position:relative;top:0;left:0;"><div id = "prompt" style="position:relative;color:black;text-align:center;top:0;left:0;right:0"';
          video_html += ' width="' + trial.width + '"';
          video_html += ' height="100"';
          video_html += '></div></div>';

          function drawnode(x, y) {

             var ele = ""
             var style = "color:black;";
             style += "position:absolute;";
             style += "z-index:100;"
             ele += "<div class='relNode' style=" + style + ">";
             ele += "<span> |</span>"
             ele += "<div>"

             $('#prompt').show();
             var node = $(ele).appendTo('#prompt');
             var width = node.width();
             var height = node.height();

             var centerX = width / 2;
             var centerY = height / 2;

             var startX = x - centerX;
             var startY = y - centerY;

             node.css("left", startX).css("top", startY);

         }

         function drawline(ax, ay, bx, by) {
             console.log('ax: ' + ax);
             console.log('ay: ' + ay);
             console.log('bx: ' + bx);
             console.log('by: ' + by);


             if (ax > bx) {
                 bx = ax + bx;
                 ax = bx - ax;
                 bx = bx - ax;
                 by = ay + by;
                 ay = by - ay;
                 by = by - ay;
             }


             console.log('ax: ' + ax);
             console.log('ay: ' + ay);
             console.log('bx: ' + bx);
             console.log('by: ' + by);

             var angle = Math.atan((ay - by) / (bx - ax));
             console.log('angle: ' + angle);

             angle = (angle * 180 / Math.PI);
             console.log('angle: ' + angle);
             angle = -angle;
             console.log('angle: ' + angle);

             var length = Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
             console.log('length: ' + length);

             var style = ""
             style += "left:" + (ax) + "px;"
             style += "top:" + (ay) + "px;"
             style += "width:" + length + "px;"
             style += "height:5px;"
             style += "background-color:rgba(0, 0, 0, .4);"
             style += "position:absolute;"
             style += "transform:rotate(" + angle + "deg);"
             style += "-ms-transform:rotate(" + angle + "deg);"
             style += "transform-origin:0% 0%;"
             style += "-moz-transform:rotate(" + angle + "deg);"
             style += "-moz-transform-origin:0% 0%;"
             style += "-webkit-transform:rotate(" + angle + "deg);"
             style += "-webkit-transform-origin:0% 0%;"
             style += "-o-transform:rotate(" + angle + "deg);"
             style += "-o-transform-origin:0% 0%;"
             style += "-webkit-box-shadow: 0px 0px 2px 2px rgba(0, 0, 0, .1);"
             style += "box-shadow: 0px 0px 2px 2px rgba(0, 0, 0, .1);"
             style += "z-index:99;"

             var line = "<div id = 'line' style='" + style + "'></div>"
             console.log(line);
             // setTimeout(()=>{$(line).appendTo('#prompt');},250);
             setTimeout(()=>{$(line).appendTo('#prompt');},250);
         }
          // add prompt if there is one
          if (trial.prompt==true) {

              var prompt_canvas = document.querySelector('#prompt');
              console.log(prompt_canvas);
              var x1 = 0;
              var x2 = trial.width;
              var y = 50;

              // drawnode(x1, y);
              // drawnode(x2, y);
              drawline(x1, y, x2, y);


          }
          display_element.innerHTML = video_html;


          // Create the change time point and response time variables
          var rt;

          var video_0 = document.querySelector('#video_0');

          // Define the end of trial scenario
          var onended = () => {
              if (trial.trial_ends_after_video) {
                  end_trial();
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
          var stim_in_trial = trial.stimulus[0].replace(/^.*[\\\/]/, '');
          for (let stim=0; stim < trial.stimulus.length; stim++){
            video_element.push(display_element.querySelector('#video_'+stim.toString()));
            if (video_preload_blob) {
                video_element[stim].src = video_preload_blob[stim];
            }
            video_element[stim].playbackRate = trial.rate;
            if (trial.mute){
              video_element[stim].muted = true;
            }
            else{
              video_element[stim].muted = false;
            }

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
                        }
                    }
                });
            }
          }


          // store response
          var response = {
              participant_id: participant_id,
              rt: [],
              key: [],
              stim_in_trial: [],
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
                  participant_id: JSON.stringify(response.participant_id),
                  rt: JSON.stringify(response.rt),
                  key: JSON.stringify(response.key),
                  stimInTrial : JSON.stringify(response.stim_in_trial),

              };
              // clear the display
              display_element.innerHTML = "";
              // move on to the next trial
              this.jsPsych.finishTrial(trial_data);
          };

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
              response.stim_in_trial.push(stim_in_trial);
              var temp = x2 * (info.rt/60000);
              console.log(temp);
              drawnode(temp, y);
              if (trial.response_ends_trial) {
                  end_trial();
              }
          };
          // start the response listener
          if (trial.choices != "NO_KEYS" && trial.response_allowed_while_playing) {
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

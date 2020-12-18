
jsPsych.plugins["lexical-ior-keyboard-response"] = (function() {

    var plugin = {};

    plugin.info = {
        name: 'lexical-ior-keyboard-response',
        description: '',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The HTML string to be displayed'
            },
            choices: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                array: true,
                pretty_name: 'Choices',
                default: jsPsych.ALL_KEYS,
                description: 'The keys the subject is allowed to press to respond to the stimulus.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Any content here will be displayed below the stimulus.'
            },
            stimulus_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Stimulus duration',
                default: null,
                description: 'How long to hide the stimulus.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'How long to show trial before it ends.'
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response ends trial',
                default: true,
                description: 'If true, trial will end when subject makes a response.'
            },
            cfg: {
                type: jsPsych.plugins.parameterType.COMPLEX,
                pretty_name: "Miscellaneous Configuration",
                default: {
                    one_dva: null,
                    additional_styles: {
                        body: {
                            "background-color": "rgb(45,45,48,255)",
                            "font-family": "sans-serif",
                            color: "white"
                        }
                    },

                },
                description: "A suite of configuration options for granular control of trial set-up."
            },

        }
    };

    plugin.additional_styles = function (data) {
        // append any additional CSS from the cfg property to the head (they are be removed later)
        let additional_styles = "";
        for (selector in data) {
            additional_styles += `\t${selector} {\n`;
            for (property in data[selector]) {
                additional_styles += `\t\t${property}: ${data[selector][property]};\n`;
            }
            additional_styles += `\t}\n\n`;
        }

        $("head").attr("id", "additional_styles").append($("<style />").html(additional_styles));
    };



    plugin.trial = function(display_element, trial) {

        plugin.one_dva = trial.cfg.one_dva;

        $('#jspsych-loading-progress-bar-container').remove();
        $("head").append(
            $("<style />").attr(`id`, `lexical-ior-keyboard-response-styles`).html(
                `body {\n` +
                    `\tbackground-color: rgb(45,45,48);\n` +
                    `\tfont-family: sans-serif;\n` +
                    `\tcolor: white;\n` +
                `}\n\n` +
                `div#display {\n` +
                    `\twidth: ${Math.ceil(2 * plugin.one_dva)}px;\n` +
                    `\theight: ${Math.ceil(3 * plugin.one_dva)}px;\n` +
                    `\tbox-sizing: border-box;\n` +
                    `\tdisplay: block;\n` +
                    `\tpadding: 0;\n` +
                    `\tmargin: auto;\n` +
                    `\tvertical-align: top;\n` +
                `}\n\n` +
                `div.box {\n` +
                    `\twidth: ${Math.ceil(2 * plugin.one_dva)}px;\n` +
                    `\theight: ${Math.ceil(1 * plugin.one_dva)}px;\n` +
                    `\tborder: ${Math.ceil(0.1 * plugin.one_dva)}px solid white;\n` +
                `}\n\n` +
                `div.box.exo-cue {\n` +
                    `\tbackground-color: white\n` +
                `}\n\n` +
                `div.box.dot {\n` +
                    `\tborder-radius: 9999px;\n` +
                    `\tbackground-color: white;\n` +
                    `\tborder: 0;\n` +
                `}\n\n` +
                `div.box.dot.small {\n` +
                    `\twidth: ${Math.ceil(0.4 * plugin.one_dva)}px;\n` +
                    `\theight: ${Math.ceil(0.4 * plugin.one_dva)}px;\n` +
                    `\tmargin: ${Math.ceil(0.3 * plugin.one_dva)}px auto;\n` +
                `}\n\n` +
                `div.box.dot.cue-back {\n` +
                    `\twidth: ${Math.ceil(0.8 * plugin.one_dva)}px;\n` +
                    `\theight: ${Math.ceil(0.8 * plugin.one_dva)}px;\n` +
                    `\tmargin: ${Math.ceil(0.1 * plugin.one_dva)}px auto;\n` +
                `}\n\n` +
                `p.target {\n` +
                    `\tcolor: white;\n` +
                    `\tfont-size: ${Math.ceil(0.5 * plugin.one_dva)}px;\n` +
                    `\ttransform: translateY(-50%);\n` +
                `}\n\n` +
                `span.key_nonword {\n` +
                    `\tfont-weight: 800;\n` +
                    `\tcolor: lightcoral;\n` +
                    `\tfont-size: ${Math.ceil(0.6 * plugin.one_dva)};px\n` +
                `}\n\n` +
                `span.key_word {` +
                    `\tfont-weight: 800;\n` +
                    `\tcolor: lightseagreen;\n` +
                    `\tfont-size: ${Math.ceil(0.6 * plugin.one_dva)};px\n` +
                `}`
            )
        );

        plugin.additional_styles(trial.cfg.additional_styles);

        var new_html = '<div id="lexical-ior-keyboard-response-styles">'+trial.stimulus+'</div>';

        // add prompt
        if(trial.prompt !== null){
            new_html += trial.prompt;
        }

        // draw
        display_element.innerHTML = new_html;

        // store response
        var response = {
            rt: null,
            key: null
        };

        // function to end trial when it is time
        var end_trial = function() {

            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            // kill keyboard listeners
            if (typeof keyboardListener !== 'undefined') {
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
            }

            // gather the data to store for the trial
            var trial_data = {
                "rt": response.rt,
                "stimulus": trial.stimulus,
                "key_press": response.key
            };

            //$("#lexical-ior-keyboard-response-styles").remove();
            //$("#additional_styles").remove();

            // clear the display
            display_element.innerHTML = '';

            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        };

        // function to handle responses by the subject
        var after_response = function(info) {

            // after a valid response, the stimulus will have the CSS class 'responded'
            // which can be used to provide visual feedback that a response was recorded
            display_element.querySelector('#lexical-ior-keyboard-response-styles').className += ' responded';

            // only record the first response
            if (response.key == null) {
                response = info;
            }

            if (trial.response_ends_trial) {
                end_trial();
            }
        };

        // start the response listener
        if (trial.choices != jsPsych.NO_KEYS) {
            var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: after_response,
                valid_responses: trial.choices,
                rt_method: 'performance',
                persist: false,
                allow_held_key: false
            });
        }

        // hide stimulus if stimulus_duration is set
        if (trial.stimulus_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                display_element.querySelector('lexical-ior-keyboard-response-styles').style.visibility = 'hidden';
            }, trial.stimulus_duration);
        }

        // end trial if trial_duration is set
        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
            }, trial.trial_duration);
        }

    };

    return plugin;
})();

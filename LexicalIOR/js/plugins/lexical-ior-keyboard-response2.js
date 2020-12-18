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

    plugin.generate_html_stimuli = function(display_element) {
        let container = $("<div />");

        $(container).append(

        )

    };
})();
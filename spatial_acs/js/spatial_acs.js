jsPsych.plugins["spatial_acs"] = (function () {

	// declare an empty object that will become our finalized plug-in
	let plugin = {};

	// we want to pre-load media; the arguments here are plug-in name, plug-in parameter, media-type
	jsPsych.pluginAPI.registerPreload('spatial_acs', 'audio', 'audio');

	plugin.info = {
		name: 'spatial_acs',
		parameters: {
			fixation: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: 'Cue Location',
				default: null,
				description: 'Initial fixation stimulus'
			},
			audio: {
				type: jsPsych.plugins.parameterType.AUDIO,
				pretty_name: "Audio Files",
				default: null,
				description: 'Audio files, if any, to accompany grid.',
			},
			soa: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: "Target Value",
				default: null,
				description: 'Duration of soa',
			},
			cue_validity: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: "Target Location",
				default: null,
				description: 'The axis and position of the target',
			}
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

	plugin.keypress_handler = function (event) {
		let key = event.which;
		if (key === 50 || key === 53) {

			plugin.data = copy(plugin.data_template);
			plugin.data.rt = performance.now() - plugin.target_on;
			plugin.data.response = key === 50 ? 'two' : 'five';
			if (plugin.feedback_trial) {
				plugin.feedback()
			} else {
				$(plugin.display_element).html('');
				setTimeout(plugin.end_trial, 1000)
			}
		}
	};

	plugin.init_audio = function() {
		// configure jsPsych's audio context
		plugin.audio_context = jsPsych.pluginAPI.audioContext();
		if (plugin.audio_context !== null) {
			var source = plugin.audio_context.createBufferSource();
			source.buffer = jsPsych.pluginAPI.getAudioBuffer(plugin.tone);
			source.connect(plugin.audio_context.destination);
		} else {
			var audio = jsPsych.pluginAPI.getAudioBuffer(plugin.tone);
			audio.currentTime = 0;
		}

	};

	plugin.play_tone = function () {
		if (plugin.audio_context !== null && !plugin.tone_playing && !build.mute) {
			plugin.audio_context.currentTime = 0;
			var source = plugin.audio_context.createBufferSource();
			source.buffer = jsPsych.pluginAPI.getAudioBuffer(plugin.tone);
			source.connect(plugin.audio_context.destination);
			source.start(0);
			plugin.tone_playing = true;
			source.onended = function () {
				plugin.tone_playing = false;
			}
		}
	};

	// used to generate live accuracy values during the exp
	plugin.feedback = function() {
		data.push(plugin.data); // done here instead of in end_trial() because it's needed for the feedback computation
		let sums = {rt: 0, accuracy: 0};
		let trials_run = 0;
		let block_data =  data.slice(-1 * trials_per_block());
		for (var t=0; t < trials_per_block(); t++) {
			let trial = block_data[t];
			trials_run += 1;
			sums.rt += trial.rt;
			sums.accuracy += trial.response == trial.target ? 1 : 0;
		}
		$("#wrapper").remove();
		$(plugin.display_element).append([
			$('<h1/>').attr('id', 'feedback').html(
		`Average Response Time: ${Math.floor(sums.rt / trials_run)}ms, Average Accuracy: ${Math.floor(100* sums.accuracy / trials_run)}%`
			),
			$('<p />').html('The experiment will not continue until a key is pressed. If you need a rest, you make take it now.')
		]);

		$('body').on('keypress', plugin.end_trial);
	};

	plugin.trial = function (display_element, trial) {
		$(display_element).append($('<div />').attr('id', 'spatial_acs_dva_frame'));
		plugin.ctoa = 200;
		plugin.cue_duration= 100;
		plugin.one_dva = trial.cfg.one_dva;
		plugin.data_template = trial.cfg.data_template;
		plugin.display_element = $('#spatial_acs_dva_frame');
		plugin.tone = trial.audio[0];
		plugin.feedback_trial = trial.cfg.feedback_trial;
		$('#jspsych-loading-progress-bar-container').remove();


		// append any additional CSS from the cfg property to the head (they are be removed later)
		// plugin.additional_styles(trial.cfg.additional_styles);

		// configure jsPsych's audio context
		plugin.init_audio();

		// create the raw html without styling
		let boxes = [];
		let ids = ['top', 'left', 'center', 'bottom', 'right'];
		for (var i = 0; i <= 4; i++) {
			var id = ids.pop();
			boxes.push(
				$('<div />').attr('id', id ).addClass(id == 'center' ? 'box zero' : 'box eight').append([
					$('<div />').addClass('digit upper'),
					$('<div />').addClass('digit lower'),
				])
			);
		}
		$(plugin.display_element).append( $('<div />').attr('id', 'wrapper').append(boxes) );
		plugin.start = performance.now();
		plugin.cue_location = array_shuffle(['top', 'bottom', 'left', 'right']).pop();
		plugin.target_location = array_shuffle(['top', 'bottom', 'left', 'right']).pop();
		plugin.target = array_shuffle(['two','five']).pop();
		// Left, right, top & bottom eights on
		setTimeout(function () {
			// fixation on
			setTimeout( function() {
				$("#center").removeClass('zero').addClass('eight');

				// cue on
				setTimeout( function() {
					plugin.play_tone();

					// these lines are fine, because #false isn't an element that exists and so isn't effected
					// by attempts to modify cue_location
					$(`#${plugin.cue_location}`).addClass('bright');

					// cue off
					setTimeout(function () {
						$(`#${plugin.cue_location}`).removeClass('bright');

						// target on
						setTimeout(function () {
							$(`#${plugin.target_location}`).removeClass('eight').addClass(plugin.target);
							plugin.target_on = performance.now();
							$('body').on('keypress', plugin.keypress_handler);
						}, 100)
					}, 100);
				}, 100);
				// swap the target

			}, 1000)
		}, 1000);



		plugin.end_trial = function () {
			jsPsych.pluginAPI.clearAllTimeouts();
			$("body").off();  // and clear handlers
			audio_context = null;
			// clear the <body> tag
			$(display_element).html('');

			if (!plugin.feedback_trial) data.push(plugin.data); // because this is done by the feedback func otherwise

			// log that shit and  move on to the next trial
			jsPsych.finishTrial(plugin.data);
		};
	};


	return plugin;

})();


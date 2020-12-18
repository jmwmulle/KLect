jsPsych.plugins["intuitive-cues"] = (function () {

	// declare an empty object that will become our finalized plug-in
	let plugin = {};

	// we want to pre-load media; the arguments here are plug-in name, plug-in parameter, media-type
	jsPsych.pluginAPI.registerPreload('intuitive-cues', 'audio', 'audio');

	plugin.info = {
		name: 'intuitive-cues',
		parameters: {
			fixation: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: 'Fixation',
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
				pretty_name: "Duration of soa",
				default: null,
				description: 'Duration of soa',
			},
			cue_validity: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: "Cue validity",
				default: null,
				description: 'Cue validity',
			},
			target: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: "Target Color",
				default: null,
				description: "Target color"
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

		// let key = String.fromCharCode(event.which);
		let key = event.which;
		if (key === 90 || key === 191) {
			if (!plugin.mute) event.data.audio_context.suspend();

			plugin.data = copy(plugin.data_template);
			plugin.data.rt = performance.now() - plugin.start;
			plugin.data.soa =  plugin.soa;
			plugin.data.target = plugin.target_color;
			plugin.data.tone = plugin.tone;
			plugin.data.response = key;
			$("#target").remove();
			$(plugin.display_element).append($("<p />").attr('id', 'rt').addClass(key === 90 ? 'black' : 'white').html(Math.floor(plugin.data.rt)));
			setTimeout(plugin.end_trial, 1000)
		}
	};


	plugin.init_audio = function () {
		// configure jsPsych's audio context
		audio_context = jsPsych.pluginAPI.audioContext();
		if (audio_context !== null) {
			source = audio_context.createBufferSource();
			source.buffer = jsPsych.pluginAPI.getAudioBuffer(plugin.tone);
			source.connect(audio_context.destination);
			let start_time = (6 - plugin.fixation.duration);
			source.start(0, start_time);
		} else {
			let audio = jsPsych.pluginAPI.getAudioBuffer(plugin.tone);
			audio.currentTime = 0;
		}

		return audio_context;
	};


	plugin.trial = function (display_element, trial) {
		plugin.tone = trial.audio;
		plugin.fixation = {
			duration: Math.random() * 2 + 1,
			type:  trial.fixation
		};
		plugin.target_color = trial.target_color;
		plugin.soa = trial.soa;
		plugin.valid = trial.cue_validity === 'valid';
		plugin.one_dva = trial.cfg.one_dva;
		plugin.data_repo = trial.cfg.data_repo;
		plugin.data_template = trial.cfg.data_template;
		plugin.mute = trial.cfg.mute;
		plugin.display_element = display_element;

		$('#jspsych-loading-progress-bar-container').remove();

		// append any additional CSS from the cfg property to the head (they are be removed later)
		// plugin.additional_styles(trial.cfg.additional_styles);

		// configure jsPsych's audio context
		let audio_context = plugin.mute ? null : plugin.init_audio();

		// add the fixation stimuli to the screen
		let fixation = [];
		for (let i = 0; i< (plugin.fixation.type === "long" ? 8 : 2); i++) fixation.push($("<div />").addClass('fix-dash'))
		$(display_element).append($("<div />").attr('id', 'fixation').append(fixation));
		// start the trial procedure

		// $("body").trigger("toggle-mono");
		setTimeout(function() {
			$("#fixation").remove();
			setTimeout( function() {
				setTimeout( function() {
					$("body").keydown({audio_context: audio_context}, plugin.keypress_handler);
					plugin.start = performance.now();
					$(display_element).append($("<div />").attr('id', 'target').addClass(`circle ${plugin.target_color}`))
				},  plugin.soa)
			}, 100)
		}, plugin.fixation.duration * 1000);





		plugin.end_trial = function () {
			jsPsych.pluginAPI.clearAllTimeouts();
			$("body").off();  // and clear handlers
			audio_context = null;
			// clear the <body> tag
			$(display_element).html('');
			// plugin.source.stop();
			// plugin.audio_context.state = "stopped";
			// plugin.source = null;
			// plugin.audio_context = null;
			data.push(plugin.data);

			// log that shit and  move on to the next trial
			jsPsych.finishTrial(plugin.data);
		};

	};

	return plugin;

})();


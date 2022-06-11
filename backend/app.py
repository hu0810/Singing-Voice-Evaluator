from flask import Flask, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json



import scipy.io.wavfile
from DataLoader import SpectralDataset, SpectralDataLoader
from models.SpectralCRNN import SpectralCRNN_Reg_Dropout_tsne as SpectralCRNN
import torch
from torch.autograd import Variable



import requests





app = Flask(__name__)

# Allow 
CORS(app)

# Path for uploaded wavs
UPLOAD_FOLDER = './wav/'

# Allowed file extransions
ALLOWED_EXTENSIONS = set(['wav'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/")
def hello():
	return "Hello World!"

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload_wav', methods=['GET', 'POST'])
def upload_wav():
	if request.method == 'POST':
		print("request data", request.data)
		print("request files", request.files)

		# check if the post request has the file part
		if 'file' not in request.files:
			return json.dumps("No file!")
		file = request.files['file']

		if file and allowed_file(file.filename):
			filename = secure_filename(file.filename)
			file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
			
			# Send uploaded wav for prediction
			predicted_wav_score = pridiction(UPLOAD_FOLDER+filename)
			print("predicted_wav_score", predicted_wav_score)

	return json.dumps(predicted_wav_score)

def pridiction(wavfile):
    wavfile=wavfile
    fs, audio = scipy.io.wavfile.read(wavfile) 
    # = audio / 32768.0
    test_tobedumped = []
    test_tobedumped.append({
                        'audio': [audio / 32768.0, fs], 
                        'ratings': [0]
                    })
    params = {'method': 'CQT', 'hop_length': 512, 'n_bins': 96, 'bins_per_octave': 24, 'normalize': True}
    dataset = SpectralDataset(test_tobedumped, 0, params)
    dataloader = SpectralDataLoader(dataset, batch_size=1, num_workers=1,shuffle=True)

    model_path = './models/model_CQT_CRNN'
    model = SpectralCRNN().cuda()
    model = torch.load(model_path)
    model.eval()


    for i, (data) in enumerate(dataloader):
        inputs, targets = data
        inputs = Variable(inputs.cuda(), requires_grad = False)
        model.init_hidden(inputs.size(0))
        out = model(inputs)[0].tolist()[0][0]

    return out



if __name__ == "__main__":
	app.run(debug=True)
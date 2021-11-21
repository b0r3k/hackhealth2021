import pickle
import numpy as np
import sklearn
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import PolynomialFeatures
import sklearn.pipeline
import lzma
import json
from copy import deepcopy
import pandas as pd

with open('codes.json') as f:
    dataset = json.load(f)

# data = [np.array(dato["codes"], dtype=np.dtype('U6')) for dato in dataset]
data = [dato["codes"] for dato in dataset]
features = dict()
for dato in data:
    for code in dato:
        features[code] = 0

new_data = []
for dato in data:
    this_features = deepcopy(features)
    for code in dato:
        this_features[code] += 1
    new_data.append(list(this_features.values()))

data = new_data

# data = np.array(data)
# data = data.reshape(-1, 1)
target = np.array([dato["as"] for dato in dataset])

RANDOM = 42
np.random.seed(RANDOM)
train_data, test_data, train_target, test_target = sklearn.model_selection.train_test_split(data, target, test_size=0.1, random_state=RANDOM)    

logreg = LogisticRegression()

# Create the pipeline with all the data transformation and regression
pipeline = sklearn.pipeline.Pipeline([("polynomial", PolynomialFeatures()), ("logreg", logreg)])

model = sklearn.model_selection.GridSearchCV(estimator=pipeline, param_grid={"polynomial__degree": [2], "logreg__C": [0.01, 0.1, 1], "logreg__solver": ["lbfgs"]}, n_jobs=2, cv=5, refit=True, return_train_score=True, verbose=2)
model = model.fit(train_data, train_target)

predictions = model.predict(test_data)
test_accuracy = sklearn.metrics.accuracy_score(test_target, predictions)
print(predictions)
test_recall = sklearn.metrics.recall_score(test_target, predictions)

results = pd.DataFrame(model.cv_results_)
for index in results.index:
    print(f"C: {results['param_logreg__C'][index]}, Degree: {results['param_polynomial__degree'][index]}, mean test: {results['mean_test_score'][index]}, rank: {results['rank_test_score'][index]}")

print(f"Test accuracy: {test_accuracy}")
print(f"Test recall: {test_recall}")

with lzma.open("test_model", "wb") as model_file:
    pickle.dump(model, model_file)
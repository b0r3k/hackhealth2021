from transformers import BertTokenizer, BertModel

import datasets
import torch.utils.data as torchdata
import torchtext.legacy.data as torchtextdata
import transformers
from transformers import AutoModelForSequenceClassification
import json
from sklearn.model_selection import train_test_split


class Dataset(torchdata.Dataset):
    """
    """
    def __init__(self, split):
        name = "patients-train.json" if split == "train" else "patients-test.json"
        with open(name) as f:
            dataset = json.load(f)
        # print(dataset[0])
        self.tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')
        data = [{"text": self.tokenize_function([block["body"] for block in d["admission"] if block["title"] == "Anamnéza:"][0]), "label": d["discharge_as"]} for d in dataset if "discharge_as" in d and "admission" in d]
        self.data = data

    def tokenize_function(self, text):
        return self.tokenizer(text, padding="max_length", truncation=True)

    def __getitem__(self, index):
        return self.data[index]

    def __len__(self):
        return len(self.data)

dataset = Dataset("train")
train, eval = train_test_split(dataset, test_size=0.2)

model = AutoModelForSequenceClassification.from_pretrained("bert-base-multilingual-cased", num_labels=2)

from transformers import TrainingArguments

training_args = TrainingArguments("test_trainer", evaluation_strategy="epoch")

import numpy as np
from datasets import load_metric

metric = load_metric("recall")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return metric.compute(predictions=predictions, references=labels)

from transformers import Trainer

trainer = Trainer(
    model=model, args=training_args, train_dataset=train, eval_dataset=eval, compute_metrics=compute_metrics)
trainer.evaluate()
import torch
import torchvision.transforms as transforms
from torchvision import models
import torch.nn as nn
from PIL import Image
import torch.nn.functional as F

def resnet50(num_classes=3):
    model = models.resnet50(weights=None)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model

class Predictor:
    def __init__(self, model_path: str):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        self.model = resnet50(num_classes=3)
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

        self.classes = ['Benigno', 'Carcinoma ductal', 'Carcinoma lobulillar']

    def predict(self, image_path: str) -> dict:
        image = Image.open(image_path).convert("RGB")
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = F.softmax(outputs, dim=1).cpu().numpy()[0]

        result_dict = {
            self.classes[i]: round(float(prob * 100), 2)
            for i, prob in enumerate(probabilities)
        }

        pred_class = self.classes[probabilities.argmax()]
        return {
            "porcentajes": result_dict,
            "prediccion_final": pred_class
        }

predictor = Predictor("app/models/resnet50_model_weights.pth")

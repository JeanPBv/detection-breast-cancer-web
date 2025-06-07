import os
import uuid
import torch
import torchvision.transforms as transforms
from torchvision import models
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
import numpy as np
import cv2
from torchcam.methods import GradCAM

MAPA_DIR = "app/images/mapas"
os.makedirs(MAPA_DIR, exist_ok=True)

def resnet50(num_classes=3):
    model = models.resnet50(weights=None)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model

def superponer_heatmap(imagen_original, heatmap, alpha=0.4):
    heatmap = cv2.resize(heatmap, imagen_original.size)
    heatmap = np.uint8(255 * heatmap)
    heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    original_array = np.array(imagen_original.convert("RGB"))[:, :, ::-1]
    superpuesta = cv2.addWeighted(original_array, 1 - alpha, heatmap_color, alpha, 0)
    return superpuesta

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

        cam_extractor = GradCAM(self.model, target_layer='layer4')

        outputs = self.model(input_tensor)
        pred_index = outputs.argmax().item()
        probabilities = F.softmax(outputs, dim=1).detach().cpu().numpy()[0]

        activation_map = cam_extractor(pred_index, outputs)[0].squeeze().cpu().numpy()
        imagen_superpuesta = superponer_heatmap(image, activation_map)

        heatmap_filename = f"mapa_calor_{uuid.uuid4().hex}.jpg"
        heatmap_path = os.path.join(MAPA_DIR, heatmap_filename)
        cv2.imwrite(heatmap_path, imagen_superpuesta)

        result_dict = {
            self.classes[i]: round(float(prob * 100), 2)
            for i, prob in enumerate(probabilities)
        }

        pred_class = self.classes[pred_index]
        return {
            "porcentajes": result_dict,
            "prediccion_final": pred_class,
            "heatmap_path": heatmap_path
        }

predictor = Predictor("app/models/resnet50_model_weights.pth")

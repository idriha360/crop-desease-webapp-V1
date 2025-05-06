# model/model_utils.py

import io
import torch
import torchvision.transforms as T
from PIL import Image
from torchvision.models import resnet50, ResNet50_Weights

class ResNetClassifier(torch.nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()
        # 1) Load pretrained ResNet50 trunk
        self.backbone = resnet50(weights=ResNet50_Weights.DEFAULT)
        # 2) Remove original head
        in_feats = self.backbone.fc.in_features
        self.backbone.fc = torch.nn.Identity()
        # 3) Add your own head
        self.classifier = torch.nn.Sequential(
            torch.nn.Linear(in_feats, 1024),
            torch.nn.ReLU(inplace=True),
            torch.nn.Dropout(0.5),
            torch.nn.Linear(1024, num_classes)
        )

    def forward(self, x):
        x = self.backbone(x)
        return self.classifier(x)


def load_model(
    model_path: str,
    num_classes: int,
    device: torch.device
) -> torch.nn.Module:
    """
    Instantiate your ResNetClassifier and load weights.
    """
    model = ResNetClassifier(num_classes=num_classes)
    state = torch.load(model_path, map_location=device)
    # If you saved state_dict or full model, adapt accordingly:
    if isinstance(state, dict) and 'state_dict' in state:
        state = state['state_dict']
    model.load_state_dict(state)
    model.to(device).eval()
    return model


def predict_image(
    model: torch.nn.Module,
    device: torch.device,
    img: Image.Image,
    class_names: list
) -> dict:
    """
    Preprocess PIL image, run inference, and return top label+confidence.
    """
    preprocess = T.Compose([
        T.Resize((224, 224)),
        T.ToTensor(),
        T.Normalize(mean=[0.485,0.456,0.406],
                    std=[0.229,0.224,0.225]),
    ])
    tensor = preprocess(img).unsqueeze(0).to(device)
    with torch.no_grad():
        logits = model(tensor)
        probs  = torch.softmax(logits, dim=1)[0]
        top_prob, top_idx = probs.max(0)

    return {
        'disease': class_names[top_idx.item()],
        'confidence': round(top_prob.item() * 100, 2)
    }

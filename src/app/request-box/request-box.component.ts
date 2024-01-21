import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {NgForOf} from "@angular/common";

export interface ApiResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

interface ModelInfo {
  name: string;
}

interface ApiTagsResponse {
  models: ModelInfo[];
}

@Component({
  selector: 'app-request-box',
  templateUrl: './request-box.component.html',
  styleUrls: ['./request-box.component.css'],
  imports: [
    FormsModule,
    NgForOf
  ],
  standalone: true
})
export class RequestBoxComponent  implements OnInit{
  userInput: string = '';
  responseText: string = '';
  model:string = 'deepseek-coder';
  models: string[] = [];

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchModels();
  }

  fetchModels() {
    this.http.get<ApiTagsResponse>('http://localhost:11434/api/tags').subscribe(response => {
      this.models = response.models.map(model => this.takeawayLatest(model.name)).sort();
    }, error => {
      console.error('Error fetching models:', error);
    });
  }

  sendRequest(): void {
    this.responseText = '';
    const requestBody = {
      model: this.model,
      prompt: this.userInput
    };

    this.streamResponse('http://localhost:11434/api/generate', requestBody);
  }

  private async streamResponse(url: string, body: any) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    // Check if response body is null
    if (!response.body) {
      console.error('Response body is null');
      return;
    }

    const reader = response.body.getReader();
    let receivedLength = 0;
    let chunks = []; // array of received binary chunks (comprises the body)

    while(true) {
      const {done, value} = await reader.read();

      if (done) {
        break;
      }

      chunks.push(value);
      receivedLength += value.length;

      const chunkAsString = new TextDecoder("utf-8").decode(value);
      const chunkAsJson = JSON.parse(chunkAsString);

      if (chunkAsJson.response) {
        this.responseText += chunkAsJson.response;
      }

      if (chunkAsJson.done) {
        break;
      }
    }
  }

  private takeawayLatest(modelName: string) {
    const [name, version] = modelName.split(":");

    return version == "latest" ? name: modelName;
  }
}

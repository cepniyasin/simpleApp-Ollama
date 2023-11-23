import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";

export interface ApiResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

@Component({
  selector: 'app-request-box',
  templateUrl: './request-box.component.html',
  styleUrls: ['./request-box.component.css'],
  imports: [
    FormsModule
  ],
  standalone: true
})
export class RequestBoxComponent {
  userInput: string = '';
  responseText: string = '';
  model:string = 'mistral';

  constructor() {}

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
}

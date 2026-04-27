import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FeatureXComponent } from './features/feature-x.component';
import { FeatureYComponent } from './features/feature-y.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FeatureXComponent, FeatureYComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}

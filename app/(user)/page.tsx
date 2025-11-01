import { Button } from '@/app/components/ui/button';
import { Squircle } from '@/app/components/ui/squircle';

export default function UserHome() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-text-primary mb-4 text-4xl font-bold">
          Welcome to E-Rates
        </h1>
        <p className="text-text-secondary mb-8 text-xl">
          Your exchange rate management system
        </p>

        <div className="mb-12 flex justify-center gap-3">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>

        <div className="mb-12">
          <h2 className="text-text-primary mb-6 text-2xl font-bold">
            Apple-Style Smooth Corners (Superellipse Formula)
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Squircle
              smoothing="ios"
              className="bg-primary flex h-40 w-40 items-center justify-center text-center"
            >
              <span className="font-semibold text-white">
                iOS Style
                <br />
                0.6
              </span>
            </Squircle>

            <Squircle
              smoothing="moderate"
              className="bg-success flex h-40 w-40 items-center justify-center text-center"
            >
              <span className="font-semibold text-white">
                Moderate
                <br />
                0.4
              </span>
            </Squircle>

            <Squircle
              smoothing="subtle"
              className="bg-warning flex h-40 w-40 items-center justify-center text-center"
            >
              <span className="font-semibold text-white">
                Subtle
                <br />
                0.2
              </span>
            </Squircle>

            <Squircle
              smoothing="extreme"
              className="bg-info flex h-40 w-40 items-center justify-center text-center"
            >
              <span className="font-semibold text-white">
                Extreme
                <br />
                0.8
              </span>
            </Squircle>
          </div>
          <p className="text-text-tertiary mt-4 text-sm">
            Using proper superellipse formula - matches Figma's corner smoothing
            exactly
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="bg-card-bg border-border-default rounded-lg border p-6">
            <h3 className="text-text-primary mb-2 text-lg font-semibold">
              Current Rates
            </h3>
            <p className="text-text-secondary">
              View the latest exchange rates
            </p>
          </div>

          <div className="bg-card-bg border-border-default rounded-lg border p-6">
            <h3 className="text-text-primary mb-2 text-lg font-semibold">
              Calculator
            </h3>
            <p className="text-text-secondary">
              Calculate currency conversions
            </p>
          </div>

          <div className="bg-card-bg border-border-default rounded-lg border p-6">
            <h3 className="text-text-primary mb-2 text-lg font-semibold">
              History
            </h3>
            <p className="text-text-secondary">View historical rate data</p>
          </div>
        </div>
      </div>
    </div>
  );
}

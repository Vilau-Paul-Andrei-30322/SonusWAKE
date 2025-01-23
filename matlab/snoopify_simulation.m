% Parameters
freq = 40000; % Frequency in Hz
c = 343; % Speed of sound in m/s
lambda = c / freq; % Wavelength
k = 2 * pi / lambda; % Wave number
d = 0.01; % Transducer spacing (10 mm)
grid_size = 200; % Simulation grid size
amplitude = 1; % Wave amplitude

% Transducer positions (3x4 grid)
[tx, ty] = meshgrid(0:d:2*d, 0:d:3*d); % Grid layout (3x4)
tx = tx(:)'; % Flatten to 1D array
ty = ty(:)';

% Simulation grid
x = linspace(-0.5, 0.5, grid_size); % Wider area for visualization
y = linspace(-0.5, 1, grid_size);   % Extend in the beam direction
[X, Y] = meshgrid(x, y);

% Compute pressure field
P = zeros(size(X));
for n = 1:length(tx)
    r = sqrt((X - tx(n)).^2 + (Y - ty(n)).^2); % Distance from transducer
    P = P + amplitude * sin(k * r); % Add wave contributions
end

% Normalize pressure field
P_normalized = P / max(abs(P(:))); % Normalize to [-1, 1]

% Visualization
figure;

% Pressure field as heatmap
subplot(1, 2, 1);
imagesc(x, y, P_normalized);
colormap('jet');
colorbar;
title('Sound Pressure Field (Parallel Emission)');
xlabel('X (m)');
ylabel('Y (m)');
axis equal;

% Pressure field as contour plot
subplot(1, 2, 2);
contourf(x, y, P_normalized, 20, 'LineColor', 'none');
colormap('jet');
colorbar;
title('Wave Interference (Contours)');
xlabel('X (m)');
ylabel('Y (m)');
axis equal;

% Overlay transducer positions
hold on;
scatter(tx, ty, 100, 'r', 'filled');
text(tx, ty, arrayfun(@num2str, 1:length(tx), 'UniformOutput', false), ...
    'VerticalAlignment', 'bottom', 'HorizontalAlignment', 'right', 'Color', 'w');

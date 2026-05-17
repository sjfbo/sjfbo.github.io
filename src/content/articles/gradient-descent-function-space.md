## Premise

Optimization can be read as geometry: an evolving path through function space, constrained by parameterization, data, and loss.

The path often matters as much as the endpoint. Two systems can land at comparable loss values and still carry very different internal structure.

## Minimal Step

```python
def step(params, grad, lr):
    return {
        name: value - lr * grad[name]
        for name, value in params.items()
    }
```

This is the familiar local move. The interesting part is what the move means after being projected through the model's parameterization.

## Reading the Trajectory

```mermaid
flowchart TB
  P0[Initial function] --> G1[Gradient step]
  G1 --> P1[Updated function]
  P1 --> G2[Gradient step]
  G2 --> P2[Learned behavior]
  R[Regularization] -.-> G1
  D[Data geometry] -.-> G2
```

## Open Thread

The full version should include diagrams, references, and a compact derivation that keeps the mechanics legible.

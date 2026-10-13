"""Compatibility entry point for the former, unused TensorFlow intent trainer.

The active system uses a measured baseline and Gemini tool routing. This command
runs evaluation; it does not claim to train a neural classifier on 40 examples.
"""
from evaluation.run import main

if __name__ == "__main__":
    main()

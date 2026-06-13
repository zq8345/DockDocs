# Gotenberg + the fonts LibreOffice needs for faithful output.
# Carlito/Caladea are metric clones of Calibri/Cambria (or Office docs reflow &
# pagination drifts); Noto CJK covers Chinese/Japanese/Korean documents.
FROM gotenberg/gotenberg:8

USER root
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      fonts-crosextra-carlito \
      fonts-crosextra-caladea \
      fonts-noto-core \
      fonts-noto-cjk \
 && rm -rf /var/lib/apt/lists/*
USER gotenberg

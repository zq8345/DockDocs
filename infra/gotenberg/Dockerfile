# Gotenberg + the fonts LibreOffice needs for faithful output.
#
# Liberation = metric clones of Arial / Times New Roman / Courier New (the three
#   fonts every Windows Office doc assumes; without them text reflows badly).
# Carlito / Caladea = Calibri / Cambria clones (modern Office defaults).
# Noto-core + CJK = Chinese / Japanese / Korean; Noto-extra = Arabic / Cyrillic /
#   Greek etc.; Noto-color-emoji = emoji glyphs in docs.
# URW Base35 = PostScript core fonts (Helvetica/Times/Courier equivalents).
FROM gotenberg/gotenberg:8

USER root
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      fonts-liberation \
      fonts-crosextra-carlito \
      fonts-crosextra-caladea \
      fonts-noto-core \
      fonts-noto-cjk \
      fonts-noto-extra \
      fonts-noto-color-emoji \
      fonts-urw-base35 \
 && fc-cache -f \
 && rm -rf /var/lib/apt/lists/*
USER gotenberg

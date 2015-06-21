head="<!DOCTYPE html>
<html>
<title>F.LF/Documentation</title>
<script src=\"projectfdocs.js\"></script>
<xmp>
"
tail="
</xmp>
</html>"
echo "$head" > index.html
find . -name "*.html" -printf "- [%f](%f)\n" >> index.html
echo "$tail" >> index.html

FROM alpine:latest

ENV http_proxy http://web-proxy.prd.hp.com:8080/
ENV no_proxy swarm,0.0.0.0

RUN apk add --update git ca-certificates && \
    rm -rf /var/cache/apk/*
ADD static /static
ADD controller /bin/controller
EXPOSE 8080
ENTRYPOINT ["/bin/controller --debug"]
